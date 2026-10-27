#!/usr/bin/env node
/**
 * Validates Day 5 v2 tile questions (t=4 word order, t=7 spell) can be completed:
 * pool has answer letters/words, correct sequence is pickable, audio present.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data/v2');

const TILE_TYPES = new Set([4, 7]);

export function buildPool(item) {
  if (!item.tiles || !item.tiles.length) return null;
  return item
    .tiles.map((w, i) => ({ w: String(w), i }))
    .concat((item.xt || []).map((w) => ({ w: String(w), i: -1 })));
}

export function tileAnswerOk(chosen, tiles) {
  return (
    chosen.length === tiles.length &&
    chosen.every((t, i) => t.w === String(tiles[i]))
  );
}

/** Wrong tray filter (by letter) — must never be used in the app; catches content that would break it. */
export function canCompleteWithWrongLetterHide(item) {
  const tiles = item.tiles.map(String);
  const pool = buildPool(item);
  if (!pool) return false;
  const chosen = [];
  const visible = () => pool.filter((t) => !chosen.some((c) => c.w === t.w));
  for (const need of tiles) {
    const t = visible().find((x) => x.w === need);
    if (!t) return false;
    chosen.push(t);
  }
  return tileAnswerOk(chosen, tiles);
}

export function canCompleteWithReferenceHide(item) {
  const tiles = item.tiles.map(String);
  const pool = buildPool(item);
  if (!pool) return false;
  const chosen = [];
  const visible = () => pool.filter((t) => chosen.indexOf(t) < 0);
  for (const need of tiles) {
    const t = visible().find((x) => x.w === need);
    if (!t) return false;
    chosen.push(t);
  }
  return tileAnswerOk(chosen, tiles);
}

export function validateItem(item, ctx) {
  const errors = [];
  const loc = `${ctx.book} ${ctx.unit} ${item.id || '(no id)'}`;
  const t = Number(item.t);
  if (!TILE_TYPES.has(t)) return errors;

  if (!item.id) errors.push(`${loc}: missing id`);
  if (!Array.isArray(item.a) || !item.a.length || !String(item.a[0] || '').trim()) {
    errors.push(`${loc}: missing or empty audio array (a)`);
  }
  if (!Array.isArray(item.tiles) || !item.tiles.length) {
    errors.push(`${loc}: missing tiles`);
    return errors;
  }
  if (item.tiles.some((w) => w == null || String(w) === '')) {
    errors.push(`${loc}: empty tile entry`);
  }
  const pool = buildPool(item);
  if (!pool.length) errors.push(`${loc}: empty tile pool`);

  for (let i = 0; i < item.tiles.length; i++) {
    const need = String(item.tiles[i]);
    const hasAnswerTile = pool.some((p) => p.i === i && p.w === need);
    if (!hasAnswerTile) errors.push(`${loc}: pool missing answer tile for slot ${i} (${need})`);
  }

  if (!canCompleteWithReferenceHide(item)) {
    errors.push(`${loc}: cannot pick correct tiles in order (check would stay disabled)`);
  }

  return errors;
}

export function validateBookFile(filePath) {
  const book = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const bookId = book.book || path.basename(filePath, '.json');
  const errors = [];
  for (const [unitId, unit] of Object.entries(book.units || {})) {
    for (const item of unit.items || []) {
      if (!TILE_TYPES.has(Number(item.t))) continue;
      errors.push(...validateItem(item, { book: bookId, unit: unitId }));
    }
  }
  return errors;
}

export function validateAllV2Books() {
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('manifest'))
    .map((f) => path.join(DATA_DIR, f));
  const all = [];
  for (const file of files) {
    all.push(...validateBookFile(file));
  }
  return all;
}

function main() {
  const errors = validateAllV2Books();
  if (errors.length) {
    console.error('Tile validation failed:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }
  console.log('Tile validation OK (' + DATA_DIR + ')');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
