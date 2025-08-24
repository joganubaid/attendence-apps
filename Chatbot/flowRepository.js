import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';

const SETTINGS_FILE = FileSystem.documentDirectory + 'chatbot_settings.json';
const FLOW_FILE = (classroomId) => FileSystem.documentDirectory + `chatbot_flow_${classroomId}.json`;
const DEFAULT_TTL_MS = 6 * 60 * 60 * 1000;

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

function validateFlow(flow) {
  if (!flow || typeof flow !== 'object') return false;
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
      if (!['text', 'image', 'input'].includes(m.type)) return false;
      if (m.type === 'text' && typeof m.text !== 'string') return false;
      if (m.type === 'image' && typeof m.imageUrl !== 'string') return false;
      if (m.type === 'input') {
        if (typeof m.prompt !== 'string') return false;
        if (typeof m.varName !== 'string' || !m.varName.trim()) return false;
        if (typeof m.nextNodeId !== 'string' || !m.nextNodeId.trim()) return false;
      }
    }
    if (node.buttons && !Array.isArray(node.buttons)) return false;
    for (const b of node.buttons || []) {
      if (!b || typeof b !== 'object' || typeof b.label !== 'string') return false;
      const a = b.action;
      if (!a || typeof a !== 'object') return false;
      if (a.type === 'go_to_node') {
        if (typeof a.targetNodeId !== 'string') return false;
      } else if (a.type === 'open_url') {
        if (typeof a.url !== 'string' || !/^https:\/\//.test(a.url)) return false;
      } else {
        return false;
      }
    }
  }
  if (!nodeIds.has(flow.startNodeId)) return false;
  return true;
}

export async function getFlow(classroomId, url, forceRefresh = false) {
  if (!isValidHttpsUrl(url)) {
    const cached = await getCachedFlow(classroomId);
    if (cached) return { ok: true, flow: cached, fromCache: true };
    return { ok: false, error: 'Invalid or missing chatbot URL' };
  }
  if (!forceRefresh) {
    const cachedWrapped = await getCachedFlowWithMeta(classroomId);
    if (cachedWrapped?.flow) {
      const isFresh = typeof cachedWrapped.cachedAt === 'number' && (Date.now() - cachedWrapped.cachedAt) < (cachedWrapped.ttlMs || DEFAULT_TTL_MS);
      if (isFresh) return { ok: true, flow: cachedWrapped.flow, fromCache: true };
    }
  }
  try {
    const flow = await fetchFlowFromUrl(url);
    if (!validateFlow(flow)) throw new Error('Malformed flow JSON');
    await setCachedFlow(classroomId, flow);
    return { ok: true, flow, fromCache: false };
  } catch (e) {
    const cached = await getCachedFlow(classroomId);
    if (cached) return { ok: true, flow: cached, fromCache: true };
    return { ok: false, error: 'Failed to fetch chatbot flow' };
  }
}

export function mapNodeToUi(node, onAction) {
  const uiMessages = [];
  const buttons = [];

  const msgs = Array.isArray(node.messages) ? node.messages : [];
  msgs.forEach((m, idx) => {
    if (m.type === 'image' && m.imageUrl) {
      uiMessages.push({ id: `${node.id}-${idx}`, type: 'image', imageUrl: m.imageUrl, text: null });
    } else if (m.type === 'text' && m.text) {
      uiMessages.push({ id: `${node.id}-${idx}`, type: 'bot', text: m.text });
    } else if (m.type === 'input') {
      uiMessages.push({ id: `${node.id}-${idx}`, type: 'input', prompt: m.prompt, varName: m.varName, nextNodeId: m.nextNodeId });
    }
  });

  const btns = Array.isArray(node.buttons) ? node.buttons : [];
  btns.forEach((b) => {
    if (!b || !b.label || !b.action) return;
    buttons.push({
      label: String(b.label),
      primary: true,
      icon: undefined,
      onPress: () => onAction(b.action)
    });
  });

  return { uiMessages, buttons };
}

export const ActionTypes = {
  GO_TO_NODE: 'go_to_node',
  OPEN_URL: 'open_url',
};