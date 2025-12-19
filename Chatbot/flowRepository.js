import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import { isSafeUrl } from '../utils/security';

const SETTINGS_FILE = FileSystem.documentDirectory + 'chatbot_settings.json';
const FLOW_FILE = (classroomId) => FileSystem.documentDirectory + `chatbot_flow_${classroomId}.json`;

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
  if (!isSafeUrl(url, { requireHttps: true })) throw new Error('Invalid HTTPS URL');
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
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function setCachedFlow(classroomId, flow) {
  await FileSystem.writeAsStringAsync(FLOW_FILE(classroomId), JSON.stringify(flow), { encoding: FileSystem.EncodingType.UTF8 });
}

async function fetchFlowFromUrl(url) {
  const res = await axios.get(url, { timeout: 15000 });
  if (typeof res.data !== 'object') throw new Error('Invalid JSON response');
  return res.data;
}

export async function getFlow(classroomId, url, forceRefresh = false) {
  if (!isSafeUrl(url, { requireHttps: true })) {
    const cached = await getCachedFlow(classroomId);
    if (cached) return { ok: true, flow: cached, fromCache: true };
    return { ok: false, error: 'Invalid or missing chatbot URL' };
  }
  if (!forceRefresh) {
    const cached = await getCachedFlow(classroomId);
    if (cached) return { ok: true, flow: cached, fromCache: true };
  }
  try {
    const flow = await fetchFlowFromUrl(url);
    // Minimal validation
    if (!flow || !flow.startNodeId || !Array.isArray(flow.nodes)) throw new Error('Malformed flow JSON');
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
    } else if (m.text) {
      uiMessages.push({ id: `${node.id}-${idx}`, type: 'bot', text: m.text });
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