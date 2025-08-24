import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';

const SETTINGS_FILE = FileSystem.documentDirectory + 'chatbot_settings.json';
const FLOW_FILE = (classroomId) => FileSystem.documentDirectory + `chatbot_flow_${classroomId}.json`;
const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000;
const CURRENT_VERSION = 2;

function isValidHttpsUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && !!u.host;
  } catch {
    return false;
  }
}

async function ensureFile(path, initial = '{}') {
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) {
    await FileSystem.writeAsStringAsync(path, initial, { encoding: FileSystem.EncodingType.UTF8 });
  }
}

export async function getSettingsUrl(classroomId) {
  try {
    await ensureFile(SETTINGS_FILE);
    const content = await FileSystem.readAsStringAsync(SETTINGS_FILE, { encoding: FileSystem.EncodingType.UTF8 });
    const json = JSON.parse(content || '{}');
    return json[classroomId] || null;
  } catch {
    return null;
  }
}

export async function setSettingsUrl(classroomId, url) {
  if (!isValidHttpsUrl(url)) throw new Error('Invalid HTTPS URL');
  await ensureFile(SETTINGS_FILE);
  const content = await FileSystem.readAsStringAsync(SETTINGS_FILE, { encoding: FileSystem.EncodingType.UTF8 });
  const json = JSON.parse(content || '{}');
  json[classroomId] = url;
  await FileSystem.writeAsStringAsync(SETTINGS_FILE, JSON.stringify(json), { encoding: FileSystem.EncodingType.UTF8 });
}

export async function getCachedFlow(classroomId) {
  try {
    const info = await FileSystem.getInfoAsync(FLOW_FILE(classroomId));
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(FLOW_FILE(classroomId), { encoding: FileSystem.EncodingType.UTF8 });
    const parsed = JSON.parse(content);
    return parsed?.flow || parsed; // backwards compatibility
  } catch {
    return null;
  }
}

async function getCachedFlowWithMeta(classroomId) {
  try {
    const info = await FileSystem.getInfoAsync(FLOW_FILE(classroomId));
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(FLOW_FILE(classroomId), { encoding: FileSystem.EncodingType.UTF8 });
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function setCachedFlow(classroomId, flow) {
  const wrapped = { flow, cachedAt: Date.now(), ttlMs: DEFAULT_TTL_MS };
  await FileSystem.writeAsStringAsync(FLOW_FILE(classroomId), JSON.stringify(wrapped), { encoding: FileSystem.EncodingType.UTF8 });
}

async function fetchFlowFromUrl(url) {
  const res = await axios.get(url, { timeout: 15000 });
  if (typeof res.data !== 'object') throw new Error('Invalid JSON response');
  return res.data;
}

function validateCondition(cond) {
  if (!cond || typeof cond !== 'object') return false;
  if (typeof cond.exists === 'string') return true;
  if (typeof cond.var === 'string' && (typeof cond.equals === 'string' || typeof cond.not === 'string' || Array.isArray(cond.oneOf))) return true;
  return false;
}

function validateFlow(flow) {
  if (!flow || typeof flow !== 'object') return false;
  if (flow.version != null && typeof flow.version !== 'number') return false;
  if (!flow.startNodeId || typeof flow.startNodeId !== 'string') return false;
  if (!Array.isArray(flow.nodes)) return false;
  const nodeIds = new Set();
  for (const node of flow.nodes) {
    if (!node || typeof node !== 'object') return false;
    if (typeof node.id !== 'string' || nodeIds.has(node.id)) return false;
    nodeIds.add(node.id);
    if (!Array.isArray(node.messages)) return false;
    for (const m of node.messages) {
      if (!m || typeof m !== 'object') return false;
      if (!['text', 'image', 'input', 'card'].includes(m.type)) return false;
      if (m.visibleIf && !validateCondition(m.visibleIf)) return false;
      if (m.type === 'text' && typeof m.text !== 'string') return false;
      if (m.type === 'image' && typeof m.imageUrl !== 'string') return false;
      if (m.type === 'input') {
        if (typeof m.prompt !== 'string') return false;
        if (typeof m.varName !== 'string' || !m.varName.trim()) return false;
        if (typeof m.nextNodeId !== 'string' || !m.nextNodeId.trim()) return false;
      }
      if (m.type === 'card') {
        if (typeof m.title !== 'string') return false;
        if (m.subtitle != null && typeof m.subtitle !== 'string') return false;
        if (m.imageUrl != null && typeof m.imageUrl !== 'string') return false;
        if (m.url != null && typeof m.url !== 'string') return false;
      }
    }
    if (node.buttons && !Array.isArray(node.buttons)) return false;
    for (const b of node.buttons || []) {
      if (!b || typeof b !== 'object' || typeof b.label !== 'string') return false;
      if (b.visibleIf && !validateCondition(b.visibleIf)) return false;
      const a = b.action;
      if (!a || typeof a !== 'object') return false;
      if (a.type === 'go_to_node') {
        if (typeof a.targetNodeId !== 'string') return false;
      } else if (a.type === 'open_url') {
        if (typeof a.url !== 'string') return false;
      } else if (a.type === 'set_var') {
        if (typeof a.varName !== 'string') return false;
        if (typeof a.value !== 'string') return false;
      } else if (a.type === 'post') {
        if (a.url && typeof a.url !== 'string') return false;
        if (a.nextNodeId && typeof a.nextNodeId !== 'string') return false;
      } else {
        return false;
      }
    }
  }
  if (!nodeIds.has(flow.startNodeId)) return false;
  return true;
}

function normalizeType(str) {
  return typeof str === 'string' ? str.toLowerCase() : str;
}

function migrateFlowV1ToV2(flow) {
  const migrated = { ...flow, version: 2 };
  migrated.nodes = (flow.nodes || []).map((node) => {
    const newNode = { ...node };
    newNode.messages = (node.messages || []).map((m) => {
      const type = normalizeType(m.type);
      if (type === 'image') {
        const imageUrl = m.imageUrl || m.url || m.image || '';
        return { type: 'image', imageUrl };
      }
      if (type === 'input') {
        return { type: 'input', prompt: String(m.prompt || 'Enter value'), varName: String(m.varName || 'value'), nextNodeId: String(m.nextNodeId || flow.startNodeId) };
      }
      if (type === 'card') {
        return { type: 'card', title: String(m.title || ''), subtitle: m.subtitle ? String(m.subtitle) : undefined, imageUrl: m.imageUrl || undefined, url: m.url || undefined };
      }
      return { type: 'text', text: String(m.text || '') };
    });
    newNode.buttons = (node.buttons || []).map((b) => {
      if (b && typeof b.action === 'string') {
        const raw = b.action.trim();
        if (raw.startsWith('go_to_node:')) {
          return { label: b.label, action: { type: 'go_to_node', targetNodeId: raw.split(':')[1] } };
        }
        if (raw.startsWith('open_url:')) {
          return { label: b.label, action: { type: 'open_url', url: raw.substring('open_url:'.length) } };
        }
      }
      const a = b?.action || {};
      const t = normalizeType(a.type);
      if (t === 'go_to_node') return { label: b.label, action: { type: 'go_to_node', targetNodeId: a.targetNodeId } };
      if (t === 'open_url') return { label: b.label, action: { type: 'open_url', url: a.url } };
      if (t === 'set_var') return { label: b.label, action: { type: 'set_var', varName: a.varName, value: String(a.value || '') } };
      if (t === 'post') return { label: b.label, action: { type: 'post', url: a.url, nextNodeId: a.nextNodeId } };
      return b;
    });
    return newNode;
  });
  migrated.meta = migrated.meta || {};
  return migrated;
}

function normalizeAndMigrate(flow) {
  const v = typeof flow.version === 'number' ? flow.version : 1;
  let out = { ...flow, version: v };
  if (v < 2) out = migrateFlowV1ToV2(out);
  return out;
}

export async function getFlow(classroomId, url, forceRefresh = false) {
  if (!isValidHttpsUrl(url)) {
    const cached = await getCachedFlow(classroomId);
    if (cached) {
      const migrated = normalizeAndMigrate(cached);
      if (validateFlow(migrated)) {
        if (migrated !== cached) await setCachedFlow(classroomId, migrated);
        return { ok: true, flow: migrated, fromCache: true };
      }
    }
    return { ok: false, error: 'Invalid or missing chatbot URL' };
  }
  if (!forceRefresh) {
    const cachedWrapped = await getCachedFlowWithMeta(classroomId);
    if (cachedWrapped?.flow) {
      const isFresh = typeof cachedWrapped.cachedAt === 'number' && (Date.now() - cachedWrapped.cachedAt) < (cachedWrapped.ttlMs || DEFAULT_TTL_MS);
      const migrated = normalizeAndMigrate(cachedWrapped.flow);
      if (validateFlow(migrated)) {
        if (migrated !== cachedWrapped.flow) await setCachedFlow(classroomId, migrated);
        if (isFresh) return { ok: true, flow: migrated, fromCache: true };
      }
    }
  }
  try {
    const fetched = await fetchFlowFromUrl(url);
    const migrated = normalizeAndMigrate(fetched);
    if (!validateFlow(migrated)) throw new Error('Malformed flow JSON');
    await setCachedFlow(classroomId, migrated);
    return { ok: true, flow: migrated, fromCache: false };
  } catch (e) {
    const cached = await getCachedFlow(classroomId);
    if (cached) {
      const migrated = normalizeAndMigrate(cached);
      if (validateFlow(migrated)) return { ok: true, flow: migrated, fromCache: true };
    }
    return { ok: false, error: 'Failed to fetch chatbot flow' };
  }
}

function templateString(str, vars) {
  if (typeof str !== 'string') return str;
  return str.replace(/\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}/g, (_, key) => {
    const value = vars?.[key];
    return value != null ? String(value) : '';
  });
}

function evalCondition(cond, vars) {
  if (!cond) return true;
  if (typeof cond.exists === 'string') return vars?.[cond.exists] != null && vars[cond.exists] !== '';
  if (typeof cond.var === 'string' && typeof cond.equals === 'string') return String(vars?.[cond.var] ?? '') === cond.equals;
  if (typeof cond.var === 'string' && typeof cond.not === 'string') return String(vars?.[cond.var] ?? '') !== cond.not;
  if (typeof cond.var === 'string' && Array.isArray(cond.oneOf)) return cond.oneOf.includes(String(vars?.[cond.var] ?? ''));
  return true;
}

export function mapNodeToUi(node, onAction, vars = {}) {
  const uiMessages = [];
  const buttons = [];

  const msgs = Array.isArray(node.messages) ? node.messages : [];
  msgs.forEach((m, idx) => {
    if (m.visibleIf && !evalCondition(m.visibleIf, vars)) return;
    if (m.type === 'image' && m.imageUrl) {
      uiMessages.push({ id: `${node.id}-${idx}`, type: 'image', imageUrl: templateString(m.imageUrl, vars), text: null });
    } else if (m.type === 'text' && m.text) {
      uiMessages.push({ id: `${node.id}-${idx}`, type: 'bot', text: templateString(m.text, vars) });
    } else if (m.type === 'input') {
      uiMessages.push({ id: `${node.id}-${idx}`, type: 'input', prompt: templateString(m.prompt, vars), varName: m.varName, nextNodeId: m.nextNodeId });
    } else if (m.type === 'card') {
      uiMessages.push({ id: `${node.id}-${idx}`, type: 'card', title: templateString(m.title, vars), subtitle: templateString(m.subtitle, vars), imageUrl: templateString(m.imageUrl, vars), url: templateString(m.url, vars) });
    }
  });

  const btns = Array.isArray(node.buttons) ? node.buttons : [];
  btns.forEach((b) => {
    if (!b || !b.label || !b.action) return;
    if (b.visibleIf && !evalCondition(b.visibleIf, vars)) return;
    const action = { ...b.action };
    if (action.url) action.url = templateString(action.url, vars);
    if (action.targetNodeId) action.targetNodeId = templateString(action.targetNodeId, vars);
    buttons.push({
      label: templateString(String(b.label), vars),
      primary: true,
      icon: undefined,
      onPress: () => onAction(action)
    });
  });

  return { uiMessages, buttons };
}

export const ActionTypes = {
  GO_TO_NODE: 'go_to_node',
  OPEN_URL: 'open_url',
};