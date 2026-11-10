// ===================== VARIANT TAG SYSTEM =====================
let colorTags = []; // [{name, hex}]
let sizeTags = [];  // [string]

function renderColorTags() {
  const el = document.getElementById('v1-tags');
  if (!el) return;
  el.innerHTML = colorTags.map((c,i) => `
    <div class="var-tag">
      <span class="var-tag-dot" style="background:${c.hex}"></span>
      ${c.name}
      <button class="var-tag-remove" onclick="removeColorTag(${i})">✕</button>
    </div>`).join('');
  rebuildVariantTable();
}

function renderSizeTags() {
  const el = document.getElementById('v2-tags');
  if (!el) return;
  el.innerHTML = sizeTags.map((s,i) => `
    <div class="var-tag">${s}<button class="var-tag-remove" onclick="removeSizeTag(${i})">✕</button></div>`).join('');
  rebuildVariantTable();
}

function addColorTag(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const input = document.getElementById('v1-input');
  const picker = document.getElementById('v1-color-picker');
  const name = input.value.trim();
  if (!name) return;
  if (colorTags.find(c => c.name.toLowerCase() === name.toLowerCase())) { input.value=''; return; }
  colorTags.push({name, hex: picker.value});
  input.value = '';
  renderColorTags();
}

function syncHexToPicker() {
  const hexInput = document.getElementById('v1-color-hex');
  const picker = document.getElementById('v1-color-picker');
  let v = hexInput.value.trim();
  if (v && !v.startsWith('#')) v = '#' + v;
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) picker.value = v;
}

function syncPickerToHex() {
  const hexInput = document.getElementById('v1-color-hex');
  const picker = document.getElementById('v1-color-picker');
  if (hexInput) hexInput.value = picker.value.toUpperCase();
}

function removeColorTag(i) { colorTags.splice(i,1); renderColorTags(); }

// ===================== SIZE DROPDOWN (Shopee-style) =====================
const SIZE_OPTIONS = {
  'Standar': ['XS','S','M','L','XL','XXL','XXXL','XXXXL','XXS'],
  'Anak': ['Anak 0-6 bln','Anak 6-12 bln','Anak 1-2 thn','Anak 2-3 thn','Anak 3-4 thn','Anak 4-5 thn','Anak 5-6 thn','Anak 6-7 thn','Anak 7-8 thn','Anak 8-9 thn','Anak 9-10 thn','Anak 10-11 thn','Anak 11-12 thn'],
  'Celana (inch)': ['27','28','29','30','31','32','33','34','36','38','40'],
  'Lainnya': ['All Size','Free Size','Oversize','Jumbo']
};
const SIZE_FLAT = Object.entries(SIZE_OPTIONS).flatMap(([cat, items]) => items.map(v => ({cat, v})));

let _sizeDropFocusIdx = -1;

function sizeDropdownShow() {
  sizeDropdownFilter(document.getElementById('v2-input')?.value || '');
}

function sizeDropdownFilter(query) {
  const dd = document.getElementById('size-dropdown');
  if (!dd) return;
  const q = query.trim().toLowerCase();
  const filtered = q ? SIZE_FLAT.filter(s => s.v.toLowerCase().includes(q)) : SIZE_FLAT;

  if (filtered.length === 0 && !q) { dd.style.display='none'; return; }

  let html = '';
  if (!q) {
    let lastCat = null;
    SIZE_FLAT.forEach(({cat, v}) => {
      if (cat !== lastCat) {
        html += `<div class="size-drop-divider">${cat}</div>`;
        lastCat = cat;
      }
      const sel = sizeTags.includes(v);
      html += `<div class="size-drop-item${sel?' selected':''}" onmousedown="sizeDropSelect('${v}')">${v}${sel?'<span class="size-check">✓</span>':''}</div>`;
    });
  } else {
    filtered.forEach(({v}) => {
      const sel = sizeTags.includes(v);
      html += `<div class="size-drop-item${sel?' selected':''}" onmousedown="sizeDropSelect('${v}')">${v}${sel?'<span class="size-check">✓</span>':''}</div>`;
    });
    const exactMatch = SIZE_FLAT.some(s => s.v.toLowerCase() === q);
    if (!exactMatch) {
      html += `<div class="size-drop-item" style="color:var(--accent);font-style:italic" onmousedown="sizeDropSelect('${query.trim()}')">+ Tambah "${query.trim()}"</div>`;
    }
  }

  dd.innerHTML = html;
  dd.style.display = 'block';
  _sizeDropFocusIdx = -1;
}

function sizeDropSelect(val) {
  if (!val) return;
  if (sizeTags.includes(val)) {
    sizeTags.splice(sizeTags.indexOf(val), 1);
  } else {
    sizeTags.push(val);
  }
  const input = document.getElementById('v2-input');
  if (input) { input.value = ''; input.focus(); }
  renderSizeTags();
  sizeDropdownFilter('');
}

function sizeInputKeydown(e) {
  const dd = document.getElementById('size-dropdown');
  const items = dd ? [...dd.querySelectorAll('.size-drop-item')] : [];
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    _sizeDropFocusIdx = Math.min(_sizeDropFocusIdx + 1, items.length - 1);
    items.forEach((el,i) => el.classList.toggle('focused', i === _sizeDropFocusIdx));
    items[_sizeDropFocusIdx]?.scrollIntoView({block:'nearest'});
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    _sizeDropFocusIdx = Math.max(_sizeDropFocusIdx - 1, 0);
    items.forEach((el,i) => el.classList.toggle('focused', i === _sizeDropFocusIdx));
    items[_sizeDropFocusIdx]?.scrollIntoView({block:'nearest'});
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (_sizeDropFocusIdx >= 0 && items[_sizeDropFocusIdx]) {
      items[_sizeDropFocusIdx].dispatchEvent(new MouseEvent('mousedown'));
    } else {
      const val = document.getElementById('v2-input')?.value.trim();
      if (val) sizeDropSelect(val);
    }
  } else if (e.key === 'Escape') {
    if (dd) dd.style.display = 'none';
  }
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('#v2-input') && !e.target.closest('#size-dropdown')) {
    const dd = document.getElementById('size-dropdown');
    if (dd) dd.style.display = 'none';
  }
});

function addSizePreset(s) {
  if (sizeTags.includes(s)) return;
  sizeTags.push(s);
  renderSizeTags();
}

function addSizeTag(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const input = document.getElementById('v2-input');
  const s = input.value.trim();
  if (!s || sizeTags.includes(s)) { input.value=''; return; }
  sizeTags.push(s);
  input.value='';
  renderSizeTags();
}

function removeSizeTag(i) { sizeTags.splice(i,1); renderSizeTags(); }

function variantKey(colorName, size) { return `${colorName}__${size}`; }

let variantData = {};
let variantPhotoFiles = {};

function rebuildVariantTable() {
  const wrap = document.getElementById('variant-table-wrap');
  const tbody = document.getElementById('variant-tbody');
  if (!wrap || !tbody) return;
  if (!colorTags.length || !sizeTags.length) { wrap.style.display='none'; return; }
  wrap.style.display='block';

  const rows = [];
  colorTags.forEach(c => {
    sizeTags.forEach((s, si) => {
      const key = variantKey(c.name, s);
      const d = variantData[key] || {};
      const existingImg = d.preview_url || d.image_url || '';
      const showPhoto = si === 0;
      const isActive = d.active !== false;
      rows.push(`
        <tr style="border-bottom:1px solid var(--border)" data-key="${key}">
          <td style="padding:10px 6px;white-space:nowrap">
            ${showPhoto ? `<div style="display:flex;align-items:center;gap:8px">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c.hex};flex-shrink:0"></span>
              <span>${c.name}</span>
            </div>
            <div style="margin-top:6px;display:flex;align-items:center;gap:6px">
              <div id="vph-${key}" style="width:36px;height:36px;border-radius:6px;background:#f0ede8;background-size:cover;background-position:center;flex-shrink:0;${existingImg?`background-image:url('${existingImg}')`:''}" data-existing="${existingImg}"></div>
              <input type="file" id="vf-${key}" accept="image/*" style="display:none" onchange="previewVariantPhotoNew(this,'${key}')"/>
              <button type="button" class="variant-photo-btn" onclick="document.getElementById('vf-${key}').click()">📷</button>
            </div>` : `<span style="margin-left:18px;color:var(--muted);font-size:12px">↳</span>`}
          </td>
          <td style="padding:10px 6px">${s}</td>
          <td style="padding:10px 6px"></td>
          <td style="padding:10px 6px"><input class="form-input vt-price" style="padding:7px 10px;font-size:12px" type="number" placeholder="Harga" value="${d.price||''}" oninput="updateVariantData('${key}','price',this.value)"/></td>
          <td style="padding:10px 6px"><input class="form-input vt-stock" style="padding:7px 10px;font-size:12px" type="number" placeholder="Stok" value="${d.stock||''}" oninput="updateVariantData('${key}','stock',this.value)"/></td>
          <td style="padding:10px 6px;text-align:center">
            <label class="variant-active-toggle" title="${isActive?'Aktif':'Nonaktif'}">
              <input type="checkbox" ${isActive?'checked':''} onchange="updateVariantData('${key}','active',this.checked)"/>
              <span class="slider"></span>
            </label>
          </td>
        </tr>`);
    });
  });
  tbody.innerHTML = rows.join('');
}

function updateVariantData(key, field, val) {
  if (!variantData[key]) variantData[key] = {};
  variantData[key][field] = val;
}

function previewVariantPhotoNew(input, key) {
  if (!input.files || !input.files[0]) return;
  variantPhotoFiles[key] = input.files[0];
  const objUrl = URL.createObjectURL(input.files[0]);
  if (!variantData[key]) variantData[key] = {};
  variantData[key].preview_url = objUrl;
  const preview = document.getElementById(`vph-${key}`);
  if (preview) preview.style.backgroundImage = `url(${objUrl})`;
}

function applyToAll() {
  const price = document.getElementById('bulk-price').value;
  const stock = document.getElementById('bulk-stock').value;
  colorTags.forEach(c => sizeTags.forEach(s => {
    const key = variantKey(c.name, s);
    if (!variantData[key]) variantData[key] = {};
    if (price) variantData[key].price = price;
    if (stock) variantData[key].stock = stock;
  }));
  rebuildVariantTable();
}

function resetVariantSystem() {
  colorTags = []; sizeTags = []; variantData = {}; variantPhotoFiles = {};
  ['v1-tags','v2-tags'].forEach(id => { const el = document.getElementById(id); if(el) el.innerHTML=''; });
  const wrap = document.getElementById('variant-table-wrap');
  if (wrap) wrap.style.display='none';
  const picker = document.getElementById('v1-color-picker');
  const hexInput = document.getElementById('v1-color-hex');
  if (picker) picker.value = '#1a1a1a';
  if (hexInput) hexInput.value = '#1A1A1A';
}

function _sharpenCanvas(canvas, amount) {
  const w = canvas.width, h = canvas.height;
  const ctx = canvas.getContext('2d');
  const src = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  const a = src.data, o = out.data;
  const k = amount;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) { o[i]=a[i]; o[i+1]=a[i+1]; o[i+2]=a[i+2]; o[i+3]=a[i+3]; continue; }
      for (let c = 0; c < 3; c++) {
        const v = a[i+c] * (1 + 4*k) - k * (a[i+c-4] + a[i+c+4] + a[i+c-w*4] + a[i+c+w*4]);
        o[i+c] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
      o[i+3] = a[i+3];
    }
  }
  ctx.putImageData(out, 0, 0);
}

function compressImage(file, maxDim = 1200, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
        else { width = Math.round(width * maxDim / height); height = maxDim; }
      }
      const minDim = 800;
      const shortSide = Math.min(width, height);
      let upscaled = false;
      if (shortSide < minDim) {
        upscaled = true;
        const up = minDim / shortSide;
        width = Math.round(width * up); height = Math.round(height * up);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const cx = canvas.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(img, 0, 0, width, height);
      try { _sharpenCanvas(canvas, upscaled ? 0.6 : 0.35); } catch (_) {}
      canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', quality);
    };
    reader.readAsDataURL(file);
  });
}

let photoSlots = [];
let cropTargetIdx = null;
let dragSrcIdx = null;

function photoStripRender() {
  const strip = document.getElementById('photo-strip');
  if (!strip) return;
  const total = photoSlots.length;
  let html = '';
  photoSlots.forEach((slot, i) => {
    const src = slot.type === 'url' ? slot.url : URL.createObjectURL(slot.blob || slot.file);
    html += `
      <div class="photo-item" id="pslot-${i}" draggable="true"
           ondragstart="photoDragStart(event,${i})" ondragover="photoDragOver(event,${i})"
           ondrop="photoDrop(event,${i})" ondragleave="photoDragLeave(event,${i})" ondragend="photoDragEnd()">
        <div class="photo-item-inner">
          <img src="${src}" alt="foto ${i+1}"/>
        </div>
        ${i===0 ? '<div class="photo-item-cover">Cover</div>' : ''}
        <div class="photo-item-actions">
          <button class="photo-action-btn" onclick="photoOpenCrop(${i})" title="Crop">✂</button>
          <button class="photo-action-btn" onclick="photoRemove(${i})" title="Hapus">🗑</button>
        </div>
      </div>`;
  });
  if (total < 9) {
    html += `
      <button class="photo-add-btn" onclick="document.getElementById('p-photos').click()" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>
        <span>Tambahkan<br>Foto (${total}/9)</span>
      </button>`;
  }
  strip.innerHTML = html;
  if (typeof photoAltsRender === 'function') photoAltsRender();
}

function photoStripHandleFiles(input) {
  const remaining = 9 - photoSlots.length;
  if (remaining <= 0) { showToast('Maksimal 9 foto per produk'); input.value=''; return; }
  const files = Array.from(input.files).slice(0, remaining);
  files.forEach(f => photoSlots.push({type:'file', file:f, blob:null, url:null}));
  input.value = '';
  photoStripRender();
}

function photoRemove(i) {
  photoSlots.splice(i, 1);
  photoStripRender();
}

function photoDragStart(e, i) {
  dragSrcIdx = i;
  e.dataTransfer.effectAllowed = 'move';
  document.getElementById(`pslot-${i}`)?.classList.add('dragging');
}
function photoDragOver(e, i) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (i !== dragSrcIdx) document.getElementById(`pslot-${i}`)?.classList.add('drag-over');
}
function photoDragLeave(e, i) {
  document.getElementById(`pslot-${i}`)?.classList.remove('drag-over');
}
function photoDrop(e, i) {
  e.preventDefault();
  document.getElementById(`pslot-${i}`)?.classList.remove('drag-over');
  if (dragSrcIdx === null || dragSrcIdx === i) return;
  const moved = photoSlots.splice(dragSrcIdx, 1)[0];
  photoSlots.splice(i, 0, moved);
  photoStripRender();
}
function photoDragEnd() {
  dragSrcIdx = null;
  document.querySelectorAll('.photo-item').forEach(el => { el.classList.remove('dragging','drag-over'); });
}

let editingProductId = null;
let adminProductsData = [];
let slugTouched = false;

function seoEsc(v) { return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function seoSlugify(str) {
  return String(str || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/g, '');
}
function seoGenderLabel(g) { return g === 'wanita' ? 'Wanita' : (g === 'pria' ? 'Pria' : ''); }
function seoWordIn(word, text) {
  return !!word && new RegExp('(^|[^a-z0-9])' + String(word).replace(/[.*+?^${}()|[\]\]/g, '\$&') + '([^a-z0-9]|$)', 'i').test(text);
}
function seoCutWords(s, max) {
  if (s.length <= max) return s;
  const c = s.slice(0, max - 1);
  const sp = c.lastIndexOf(' ');
  return (sp > 40 ? c.slice(0, sp) : c).replace(/[\s.,;:\-]+$/, '') + '…';
}
function seoFormContext() {
  const val = id => (document.getElementById(id) || {}).value || '';
  const catId = val('p-cat-id');
  const prices = [];
  Object.keys(variantData || {}).forEach(k => { const n = parseInt((variantData[k] || {}).price) || 0; if (n > 0) prices.push(n); });
  return {
    name: val('p-name').trim(),
    cat: catId ? catName(catId) : '',
    gender: seoGenderLabel(val('p-gender')),
    bahan: val('p-bahan').trim(), ketebalan: val('p-ketebalan').trim(), lengan: val('p-lengan').trim(),
    gramasi: parseInt(val('p-gramasi')) || 0,
    colors: (colorTags || []).map(c => c.name),
    minPrice: prices.length ? Math.min.apply(null, prices) : 0
  };
}
function seoAutoTitle(c) {
  c = c || seoFormContext();
  if (!c['name']) return '';
  const tail = [c['cat'], c['gender']].filter(x => x && !seoWordIn(x, c['name'])).join(' ');
  const t = tail ? `${c['name']} | ${tail} | Zenoot` : `${c['name']} | Zenoot`;
  return t.length > 65 ? `${c['name']} | Zenoot` : t;
}
function seoAutoDesc(c) {
  c = c || seoFormContext();
  if (!c['name']) return '';
  const lead = [c['name'], c['cat'] && !seoWordIn(c['cat'], c['name']) ? c['cat'] : '', c['gender'] && !seoWordIn(c['gender'], c['name']) ? c['gender'] : ''].filter(Boolean).join(' ');
  const parts = [lead + ' dari Zenoot Bandung.'];
  const spec = [];
  if (c['bahan']) spec.push('Bahan ' + c['bahan']);
  if (c['gramasi']) spec.push(c['gramasi'] + ' gr/m²');
  if (c['ketebalan']) spec.push('ketebalan ' + c['ketebalan'].toLowerCase());
  if (c['lengan']) spec.push('lengan ' + c['lengan'].toLowerCase());
  if (spec.length) parts.push(spec.join(', ') + '.');
  if (c['colors'].length) parts.push(c['colors'].length + ' pilihan warna' + (c['colors'].length <= 5 ? ': ' + c['colors'].join(', ') : '') + '.');
  if (c['minPrice']) parts.push('Harga mulai ' + fRp(c['minPrice']).replace('Rp', 'Rp ') + '.');
  return seoCutWords(parts.join(' '), 158);
}
function seoFormChanged() {
  const t = document.getElementById('p-seo-title'), d = document.getElementById('p-seo-desc'), sl = document.getElementById('p-slug');
  if (!t || !d || !sl) return;
  const clean = sl.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-{2,}/g, '-');
  if (clean !== sl.value) sl.value = clean;
  const c = seoFormContext();
  const title = t.value.trim() || seoAutoTitle(c) || 'Judul produk | Zenoot';
  const desc = d.value.trim() || seoAutoDesc(c) || 'Deskripsi produk akan dibuat otomatis.';
  const slug = sl.value.replace(/^-+|-+$/g, '') || seoSlugify(c.name) || 'nama-produk';
  document.getElementById('seo-title-count').textContent = t.value ? `(${t.value.length}/60 disarankan)` : '(otomatis)';
  document.getElementById('seo-desc-count').textContent = d.value ? `(${d.value.length}/160 disarankan)` : '(otomatis)';
  document.getElementById('seo-prev-url').textContent = 'zenoot.web.id › produk › ' + slug;
  const linkEl = document.getElementById('seo-link-url');
  if (linkEl) {
    linkEl.value = 'https://zenoot.web.id/produk/' + slug + '/';
    const note = document.getElementById('seo-link-note');
    if (note) note.textContent = editingProductId
      ? 'Halaman ini dibuat otomatis oleh GitHub Actions tiap 4 jam.'
      : 'Simpan produk dulu.';
  }
  document.getElementById('seo-prev-title').textContent = seoCutWords(title, 62);
  document.getElementById('seo-prev-desc').textContent = seoCutWords(desc, 160);
}
function seoLinkValue() {
  const el = document.getElementById('seo-link-url');
  return el ? el.value : '';
}
function seoLinkCopy() {
  const url = seoLinkValue();
  if (!url) return Promise.resolve(false);
  return navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(url).then(() => { showToast('Link SEO disalin ✓'); return true; }) : Promise.resolve(false);
}
function seoLinkOpenGsc() {
  seoLinkCopy();
  window.open('https://search.google.com/search-console', '_blank', 'noopener');
}
function seoLinkOpenPage() {
  const url = seoLinkValue();
  if (url) window.open(url, '_blank', 'noopener');
}
function seoProductUrl(p) {
  if (!p) return '';
  const s = String(p.slug || '').trim().toLowerCase() || seoSlugify(p.name);
  return s ? 'https://zenoot.web.id/produk/' + s + '/' : '';
}
function seoCopyProduct(id) {
  const p = adminProductsData.find(x => x.id === id);
  const url = seoProductUrl(p);
  if (!url) { showToast('Produk belum punya slug'); return; }
  navigator.clipboard.writeText(url).then(() => showToast('Link disalin ✓'));
}
function seoShareProduct(id) {
  const p = adminProductsData.find(x => x.id === id);
  const url = seoProductUrl(p);
  if (!url) return;
  if (navigator.share) navigator.share({ title: p.name, url }).catch(()=>{});
  else seoCopyProduct(id);
}
function seoAutofill() {
  const c = seoFormContext();
  if (!c.name) { showToast('Isi nama produk dulu'); return; }
  document.getElementById('p-seo-title').value = seoAutoTitle(c);
  document.getElementById('p-seo-desc').value = seoAutoDesc(c);
  if (!editingProductId || !document.getElementById('p-slug').value) document.getElementById('p-slug').value = seoSlugify(c.name);
  seoFormChanged();
  showToast('SEO terisi otomatis');
}
function photoAltsRender() {
  const box = document.getElementById('photo-alts-list');
  if (!box) return;
  if (!photoSlots.length) { box.innerHTML = '<p style="font-size:12px;color:var(--muted)">Belum ada foto.</p>'; return; }
  box.innerHTML = photoSlots.map((slot, i) => {
    const src = slot.type === 'url' ? slot.url : URL.createObjectURL(slot.blob || slot.file);
    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <img src="${seoEsc(src)}" alt="" style="width:34px;height:34px;object-fit:cover;border-radius:4px;flex-shrink:0"/>
      <input class="form-input" style="padding:7px 10px;font-size:13px" maxlength="125" placeholder="${i === 0 ? 'Cover' : 'Foto ' + (i + 1)}" value="${seoEsc(slot.alt || '')}" oninput="photoSlots[${i}].alt=this.value"/>
    </div>`;
  }).join('');
}
function numOrNull(id) {
  const v = parseFloat((document.getElementById(id) || {}).value);
  return Number.isFinite(v) && v > 0 ? v : null;
}
function collectExtraFields(imageAlts) {
  const val = id => ((document.getElementById(id) || {}).value || '').trim();
  const name = val('p-name');
  let slug = val('p-slug').replace(/^-+|-+$/g, '') || seoSlugify(name);
  return {
    slug: slug || null,
    seo_title: val('p-seo-title') || null,
    seo_description: val('p-seo-desc') || null,
    image_alts: imageAlts,
    lengan: val('p-lengan') || null,
    gramasi_gsm: numOrNull('p-gramasi') ? Math.round(numOrNull('p-gramasi')) : null,
    lingkar_dada_cm: numOrNull('p-lingkar-dada'),
    panjang_cm: numOrNull('p-panjang'),
    perawatan: val('p-perawatan') || null,
    weight_gram: numOrNull('p-weight') ? Math.round(numOrNull('p-weight')) : null,
    pkg_length_cm: numOrNull('p-pkg-l'),
    pkg_width_cm: numOrNull('p-pkg-w'),
    pkg_height_cm: numOrNull('p-pkg-h')
  };
}
function isMissingColumnError(err) {
  return !!err && (err.code === 'PGRST204' || err.code === '42703' || /column .* does not exist/i.test(err.message || ''));
}
async function saveWithExtras(write, base, extra) {
  let res = await write({ ...base, ...extra });
  if (res.error && isMissingColumnError(res.error)) {
    res = await write(base);
    res.extrasMissing = !res.error;
  }
  return res;
}
function fillExtraFields(p) {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = (v == null ? '' : v); };
  set('p-lengan', p.lengan); set('p-gramasi', p.gramasi_gsm); set('p-lingkar-dada', p.lingkar_dada_cm);
  set('p-panjang', p.panjang_cm); set('p-perawatan', p.perawatan);
  set('p-weight', p.weight_gram); set('p-pkg-l', p.pkg_length_cm); set('p-pkg-w', p.pkg_width_cm); set('p-pkg-h', p.pkg_height_cm);
  set('p-seo-title', p.seo_title); set('p-seo-desc', p.seo_description);
  set('p-slug', p.slug || seoSlugify(p.name));
  slugTouched = true;
  seoFormChanged();
}
function clearExtraFields() {
  ['p-lengan','p-gramasi','p-lingkar-dada','p-panjang','p-perawatan','p-weight','p-pkg-l','p-pkg-w','p-pkg-h','p-seo-title','p-seo-desc','p-slug']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  slugTouched = false;
  seoFormChanged();
}

async function saveProduct() {
  const name = document.getElementById('p-name').value.trim();
  const category_id = document.getElementById('p-cat-id').value || null;
  const category = category_id ? catName(category_id) : null;
  const gender = document.getElementById('p-gender').value;
  const supplier_id = document.getElementById('p-supplier').value || null;
  const supplier = null;
  const description = document.getElementById('p-desc').value.trim();
  const bahan = document.getElementById('p-bahan').value.trim() || null;
  const tipe_cutting = document.getElementById('p-tipe-cutting').value.trim() || null;
  const ketebalan = document.getElementById('p-ketebalan').value.trim() || null;
  const motif = document.getElementById('p-motif').value.trim() || null;
  const dipakai_model = document.getElementById('p-dipakai-model').value.trim() || null;
  if (!name) { showToast('Nama produk wajib diisi'); return; }
  if (!category_id) { showToast('Kategori wajib dipilih'); return; }

  if (colorTags.length) {
    if (!sizeTags.length) { showToast('Isi minimal 1 ukuran'); return; }
    const colorsWithNoPrice = colorTags.filter(c =>
      !sizeTags.some(s => (parseInt((variantData[variantKey(c.name, s)] || {}).price) || 0) > 0)
    );
    if (colorsWithNoPrice.length) {
      showToast(`Isi harga untuk warna: ${colorsWithNoPrice.map(c=>c.name).join(', ')}`);
      return;
    }
  }

  setProductSaving(true);
  try {
    const preSlug = collectExtraFields(null).slug;
    if (preSlug) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(preSlug)) { showToast('Slug hanya boleh huruf kecil & angka'); return; }
      const { data: dup } = await sb.from('products').select('id,name').ilike('slug', preSlug).limit(5);
      if ((dup || []).some(r => r.id !== editingProductId)) {
        showToast('Slug sudah dipakai produk lain');
        pfSwitchTab(2);
        return;
      }
    }

    const finalUrls = [];
    const finalAlts = [];
    for (const slot of photoSlots) {
      if (slot.type === 'url') {
        finalUrls.push(slot.url);
        finalAlts.push((slot.alt || '').trim());
      } else {
        const raw = slot.blob || slot.file;
        if (!raw) continue;
        const compressed = await compressImage(raw);
        const path = `${Date.now()}-${Math.random().toString(36).slice(2,7)}.jpg`;
        const { error: upErr } = await sb.storage.from('product-photos').upload(path, compressed, { contentType: 'image/jpeg' });
        if (!upErr) {
          const { data: urlData } = sb.storage.from('product-photos').getPublicUrl(path);
          finalUrls.push(urlData.publicUrl);
          finalAlts.push((slot.alt || '').trim());
        }
      }
    }
    const image_urls = finalUrls.length ? finalUrls : null;
    const extra = collectExtraFields(finalAlts.some(a => a) ? finalAlts : null);
    const image_url = finalUrls.length ? finalUrls[0] : null;

    let prod;
    let extrasMissing = false;
    let existingVars = [];
    if (editingProductId) {
      const payload = {name,category,category_id,gender,supplier,supplier_id,description,bahan,tipe_cutting,ketebalan,motif,dipakai_model,image_url,image_urls};
      const res = await saveWithExtras(b => sb.from('products').update(b).eq('id',editingProductId).select().single(), payload, extra);
      if (res.error) { showToast('Gagal update: ' + res.error.message); return; }
      prod = res.data; extrasMissing = !!res.extrasMissing;
      const exRes = await sb.from('variants').select('id,color_name,size').eq('product_id', prod.id);
      existingVars = exRes.data || [];
    } else {
      const res = await saveWithExtras(b => sb.from('products').insert(b).select().single(), {name,category,category_id,gender,supplier,supplier_id,description,bahan,tipe_cutting,ketebalan,motif,dipakai_model,image_url,image_urls}, extra);
      if (res.error) { showToast('Gagal simpan: ' + res.error.message); return; }
      prod = res.data; extrasMissing = !!res.extrasMissing;
    }

    const variants = [];
    for (const c of colorTags) {
      const firstKey = variantKey(c.name, sizeTags[0]);
      let variantImageUrl = null;
      const existingPreview = document.getElementById(`vph-${firstKey}`);
      if (existingPreview && existingPreview.dataset.existing) variantImageUrl = existingPreview.dataset.existing;
      if (variantPhotoFiles[firstKey]) {
        const compressed = await compressImage(variantPhotoFiles[firstKey]);
        const path = `variant-${Date.now()}-${Math.random().toString(36).slice(2,7)}.jpg`;
        const { error: upErr } = await sb.storage.from('product-photos').upload(path, compressed, { contentType: 'image/jpeg' });
        if (!upErr) {
          const { data: urlData } = sb.storage.from('product-photos').getPublicUrl(path);
          variantImageUrl = urlData.publicUrl;
        }
      }
      for (const s of sizeTags) {
        const key = variantKey(c.name, s);
        const d = variantData[key] || {};
        const price = parseInt(d.price)||0;
        if (!price) continue;
        variants.push({
          product_id: prod.id,
          color_name: c.name,
          color_hex: c.hex,
          size: s,
          price,
          original_price: null,
          stock: parseInt(d.stock)||0,
          image_url: variantImageUrl,
          is_active: d.active !== false
        });
      }
    }
    const vKey = v => String(v.color_name) + '' + String(v.size);
    const existingByKey = new Map(existingVars.map(e => [vKey(e), e.id]));
    const keepIds = new Set();
    const toInsert = [];
    for (const v of variants) {
      const id = existingByKey.get(vKey(v));
      if (id) {
        keepIds.add(id);
        await sb.from('variants').update({
          color_hex: v.color_hex, price: v.price, stock: v.stock, image_url: v.image_url, is_active: v.is_active
        }).eq('id', id);
      } else {
        toInsert.push(v);
      }
    }
    if (toInsert.length) await sb.from('variants').insert(toInsert);
    const dropIds = existingVars.map(e => e.id).filter(id => !keepIds.has(id));
    if (dropIds.length) await sb.from('variants').delete().in('id', dropIds);

    showToast(editingProductId ? 'Produk berhasil diupdate ✓' : 'Produk berhasil disimpan ✓');
    closeProductForm();
    loadAdminProducts();
  } finally {
    setProductSaving(false);
  }
}

function setProductSaving(isSaving) {
  const btn = document.getElementById('save-product-btn-final');
  if (btn) {
    btn.disabled = isSaving;
    btn.style.opacity = isSaving ? '0.7' : '';
    if (isSaving) {
      btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Menyimpan...';
    } else if (btn.dataset.originalText) {
      btn.textContent = btn.dataset.originalText;
    }
  }
}

function resetUploadState() {
  photoSlots = [];
  photoStripRender();
}

function prefillPhotosFromProduct(p) {
  const urls = (p.image_urls && p.image_urls.length) ? p.image_urls : (p.image_url ? [p.image_url] : []);
  const alts = Array.isArray(p.image_alts) ? p.image_alts : [];
  photoSlots = urls.map((url, i) => ({type:'url', url, file:null, blob:null, alt: alts[i] || ''}));
  photoStripRender();
}

function cancelEdit() {
  editingProductId = null;
  resetProductForm();
  document.getElementById('form-mode-title').textContent = 'Tambah Produk';
  document.getElementById('edit-actions-extra')?.classList.add('hidden');
  if (typeof pfResetTabs === 'function') pfResetTabs();
}

function openProductForm() {
  cancelEdit();
  document.getElementById('product-list-view').classList.add('hidden');
  document.getElementById('product-form-card').classList.remove('hidden');
  window.scrollTo({top:0, behavior:'smooth'});
}

function closeProductForm() {
  cancelEdit();
  document.getElementById('product-form-card').classList.add('hidden');
  document.getElementById('product-list-view').classList.remove('hidden');
}

function editProduct(id) {
  const p = adminProductsData.find(x=>x.id===id);
  if (!p) return;
  editingProductId = id;
  document.getElementById('p-name').value = p.name;
  document.getElementById('p-supplier').value = p.supplier_id || '';
  document.getElementById('p-cat-id').value = p.category_id || '';
  const catBtn = document.getElementById('p-cat-btn');
  if (p.category_id) { catBtn.textContent = categoryBreadcrumb(p.category_id); catBtn.classList.add('filled'); }
  else { catBtn.textContent = p.category || 'Pilih kategori'; catBtn.classList.remove('filled'); }
  document.getElementById('p-gender').value = p.gender || 'pria';
  document.getElementById('p-desc').value = p.description || '';
  document.getElementById('p-bahan').value = p.bahan || '';
  document.getElementById('p-tipe-cutting').value = p.tipe_cutting || '';
  document.getElementById('p-ketebalan').value = p.ketebalan || '';
  document.getElementById('p-motif').value = p.motif || '';
  document.getElementById('p-dipakai-model').value = p.dipakai_model || '';
  fillExtraFields(p);
  prefillPhotosFromProduct(p);
  resetVariantSystem();
  const vars = p.variants || [];
  const seenColors = new Map();
  const seenSizes = new Set();
  vars.forEach(v => {
    if (!seenColors.has(v.color_name)) seenColors.set(v.color_name, v.color_hex || '#1a1a1a');
    seenSizes.add(v.size);
  });
  colorTags = Array.from(seenColors.entries()).map(([name,hex]) => ({name,hex}));
  sizeTags = Array.from(seenSizes);
  vars.forEach(v => {
    const key = variantKey(v.color_name, v.size);
    variantData[key] = {price: v.price, orig: v.original_price, stock: v.stock, image_url: v.image_url, active: v.is_active !== false};
  });
  renderColorTags();
  renderSizeTags();
  document.getElementById('form-mode-title').textContent = `Edit Produk: ${p.name}`;
  document.getElementById('product-list-view').classList.add('hidden');
  document.getElementById('product-form-card').classList.remove('hidden');
  document.getElementById('edit-actions-extra')?.classList.remove('hidden');
  document.getElementById('status-toggle-btn').textContent = productStatus(p) === 'nonaktif' ? 'Aktifkan' : 'Arsipkan';
  if (typeof pfResetTabs === 'function') pfResetTabs();
  requestAnimationFrame(() => { renderColorTags(); renderSizeTags(); });
  window.scrollTo({top:0, behavior:'smooth'});
}

const LOW_STOCK_THRESHOLD = 5;
let bulkSelected = new Set();
let expandedProductId = null;
let productSalesMap = {};
let variantSalesMap = {};
let lastRenderedIds = [];
let productStatusTab = 'semua';
let lowStockOnly = false;
let noPromoOnly = false;
let selectModeOn = false;

function toggleSelectMode() {
  selectModeOn = !selectModeOn;
  bulkSelected.clear();
  document.getElementById('col-check-th')?.classList.toggle('hidden', !selectModeOn);
  const btn = document.getElementById('pf-selectmode-btn');
  if (btn) { btn.textContent = selectModeOn ? 'Batal Pilih' : 'Pilih Produk'; btn.classList.toggle('active', selectModeOn); }
  renderAdminProductList();
}

function productStatus(p) {
  return p.status || (p.is_active ? 'aktif' : 'nonaktif');
}
function productHasPromo(p) {
  return (p.variants || []).some(v => v.original_price != null);
}
function setProductStatusTab(tab) {
  productStatusTab = tab;
  renderAdminProductList();
}
function toggleLowStockFilter() {
  lowStockOnly = !lowStockOnly;
  document.getElementById('pf-lowstock-chip')?.classList.toggle('active', lowStockOnly);
  renderAdminProductList();
}
function toggleNoPromoFilter() {
  noPromoOnly = !noPromoOnly;
  document.getElementById('pf-nopromo-chip')?.classList.toggle('active', noPromoOnly);
  renderAdminProductList();
}
function renderStatusTabs() {
  const el = document.getElementById('prod-status-tabs');
  if (!el) return;
  const counts = { semua: adminProductsData.length, aktif: 0, nonaktif: 0 };
  adminProductsData.forEach(p => { const s = productStatus(p); if (counts[s] !== undefined) counts[s]++; });
  const tabs = [
    ['semua', 'Semua'],
    ['aktif', 'Aktif'],
    ['nonaktif', 'Di Arsipkan'],
  ];
  el.innerHTML = tabs.map(([key,label]) =>
    `<button class="pstab ${productStatusTab===key?'active':''}" onclick="setProductStatusTab('${key}')">${label} <span class="pstab-n">(${counts[key]})</span></button>`
  ).join('');
}

function fRp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
function priceRangeStr(vars, field) {
  const vals = vars.map(v => v[field]).filter(v => v !== null && v !== undefined);
  if (!vals.length) return null;
  const min = Math.min(...vals), max = Math.max(...vals);
  return min === max ? fRp(min) : `${fRp(min)}–${fRp(max)}`;
}

async function loadProductSales() {
  const { data } = await sb.from('orders').select('items');
  productSalesMap = {};
  variantSalesMap = {};
  (data || []).forEach(o => {
    (o.items || []).forEach(it => {
      if (!it.productId) return;
      productSalesMap[it.productId] = (productSalesMap[it.productId] || 0) + (it.qty || 0);
      if (it.variantId) variantSalesMap[it.variantId] = (variantSalesMap[it.variantId] || 0) + (it.qty || 0);
    });
  });
}

async function loadAdminProducts() {
  const [prodRes] = await Promise.all([
    sb.from('products').select('*,variants(*)').order('created_at', {ascending:false}),
    loadProductSales()
  ]);
  adminProductsData = prodRes.data || [];
  bulkSelected.clear();
  renderAdminProductList();
}

function productLowestStock(p) {
  const vars = p.variants || [];
  if (!vars.length) return 0;
  return Math.min(...vars.map(v => v.stock ?? 0));
}
function productTotalStock(p) {
  return (p.variants || []).reduce((sum,v) => sum + (v.stock ?? 0), 0);
}

function prodSortCycle(col) {
  const sel = document.getElementById('pf-sort');
  if (!sel) return;
  const asc = col + '-asc', desc = col + '-desc';
  sel.value = sel.value === asc ? desc : (sel.value === desc ? 'newest' : asc);
  renderAdminProductList();
}
function prodSortSync() {
  const cur = (document.getElementById('pf-sort') || {}).value || 'newest';
  document.querySelectorAll('.prod-sort-btn[data-col]').forEach(btn => {
    const col = btn.dataset.col;
    const state = cur === col + '-asc' ? 'asc' : (cur === col + '-desc' ? 'desc' : '');
    btn.dataset.state = state;
  });
}

function renderAdminProductList() {
  const el = document.getElementById('admin-products-render');
  if (!el) return;
  renderStatusTabs();
  prodSortSync();
  if (!adminProductsData.length) { el.innerHTML=`<tr><td colspan="${selectModeOn?10:9}" style="color:var(--muted);font-size:13px;padding:20px">Belum ada produk.</td></tr>`; updateBulkBar(); return; }

  const q = (document.getElementById('pf-search')?.value || '').trim().toLowerCase();
  const genderF = document.getElementById('pf-gender')?.value || '';
  const supplierF = document.getElementById('pf-supplier')?.value || '';
  const categoryF = document.getElementById('pf-category')?.value || '';
  const sortF = document.getElementById('pf-sort')?.value || 'newest';

  let list = adminProductsData.filter(p => {
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (genderF && p.gender !== genderF) return false;
    if (productStatusTab !== 'semua' && productStatus(p) !== productStatusTab) return false;
    if (lowStockOnly && productLowestStock(p) > LOW_STOCK_THRESHOLD) return false;
    if (noPromoOnly && productHasPromo(p)) return false;
    if (supplierF && p.supplier_id !== supplierF) return false;
    if (categoryF && p.category_id !== categoryF) return false;
    return true;
  });

  if (sortF === 'name') list = list.slice().sort((a,b)=>a.name.localeCompare(b.name));
  else if (sortF === 'stock-asc') list = list.slice().sort((a,b)=>productTotalStock(a)-productTotalStock(b));
  else if (sortF === 'stock-desc') list = list.slice().sort((a,b)=>productTotalStock(b)-productTotalStock(a));
  else if (sortF === 'sold-desc') list = list.slice().sort((a,b)=>(productSalesMap[b.id]||0)-(productSalesMap[a.id]||0));
  else if (sortF === 'sold-asc') list = list.slice().sort((a,b)=>(productSalesMap[a.id]||0)-(productSalesMap[b.id]||0));
  else if (sortF === 'supplier') list = list.slice().sort((a,b)=>supplierName(a.supplier_id).localeCompare(supplierName(b.supplier_id)));

  if (!list.length) { el.innerHTML=`<tr><td colspan="${selectModeOn?10:9}" style="color:var(--muted);font-size:13px;padding:20px">Nggak ada produk yang cocok.</td></tr>`; updateBulkBar(); return; }

  el.innerHTML = list.map(p => {
    const vars = p.variants || [];
    const lowest = productLowestStock(p);
    const isLow = vars.length && lowest <= LOW_STOCK_THRESHOLD;
    const isOpen = expandedProductId === p.id;
    const hasDiscount = vars.some(v => v.original_price != null);
    const netStr = priceRangeStr(vars, 'price') || '-';
    const jualStr = hasDiscount ? priceRangeStr(vars, 'original_price') : null;
    const sold = productSalesMap[p.id] || 0;
    const pmTags = `${isLow?'<span class="pm-tag">Stok menipis</span>':''}${productHasPromo(p)?'<span class="pm-tag">Promo</span>':''}${productStatus(p)!=='aktif'?'<span class="pm-tag off">Di Arsipkan</span>':''}`;
    const pmCard = `
        <div class="pm-card">
          <div class="pm-top">
            <div class="pm-img">${p.image_url?`<img src="${p.image_url}" alt="" loading="lazy"/>`:''}</div>
            <div class="pm-info">
              <div class="pm-name">${p.name}</div>
              ${pmTags?`<div class="pm-tags">${pmTags}</div>`:''}
              <div class="pm-price">${hasDiscount?`<s>${jualStr}</s>`:''}${netStr}</div>
            </div>
          </div>
          <div class="pm-stats"><span>Penjualan<b>${sold}</b></span><span>Stok<b>${productTotalStock(p)}</b></span><span>${vars.length} varian</span></div>
          <div class="pm-actions">
            <button type="button" class="pm-btn pm-more" onclick="openProductSheet('${p.id}')" aria-label="Lainnya">&#8943;</button>
            <button type="button" class="pm-btn pm-share" onclick="seoShareProduct('${p.id}')" aria-label="Bagikan link">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
            </button>
            ${vars.length ? `<button type="button" class="pm-btn" onclick="toggleVariantBreakdown('${p.id}')">${isOpen?'Sembunyikan varian':'Lihat varian'}</button>` : ''}
            <button type="button" class="pm-btn pri" onclick="editProduct('${p.id}')">Ubah</button>
          </div>
        </div>`;
    const row = `
    <tr>
      ${selectModeOn ? `<td class="pt-check"><input type="checkbox" class="prod-check" ${bulkSelected.has(p.id)?'checked':''} onchange="toggleBulkCheck('${p.id}',this.checked)"/></td>` : ''}
      <td class="pt-main">
        <div class="prod-cell-main">
          <div class="admin-product-img">${p.image_url?`<img src="${p.image_url}"/>`:`<div style="width:100%;height:100%;background:#f0ede8"></div>`}</div>
          <div class="prod-info">
            <div class="prod-name"><span class="prod-name-text" title="${seoEsc(p.name)}">${p.name}</span></div>
            <div class="prod-sub">${capitalize(p.gender)} · ${vars.length} varian${isLow?`<span class="badge-lowstock">Stok menipis</span>`:''}${productHasPromo(p)?`<span class="badge-promo">Promo</span>`:''}</div>
            ${vars.length ? `<button class="variant-toggle" onclick="toggleVariantBreakdown('${p.id}')">${isOpen?'Sembunyikan varian':'Lihat stok per varian'}</button>` : ''}
          </div>
        </div>
        ${pmCard}
      </td>
      <td class="pt-x">
        <div class="seo-cell">
          <button type="button" class="seo-share-btn" onclick="seoShareProduct('${p.id}')">Bagikan</button>
          <button type="button" class="seo-copy-btn" onclick="seoCopyProduct('${p.id}')">Salin link</button>
        </div>
      </td>
      <td class="pt-x">${p.category||'-'}</td>
      <td class="pt-x">${hasDiscount?`<span class="prod-price-old">${jualStr}</span>`:''}<span class="prod-price-net">${netStr}</span></td>
      <td class="prod-stock-num pt-x">${productTotalStock(p)}</td>
      <td class="prod-sold-num pt-x">${sold}</td>
      <td class="pt-x">${p.supplier_id ? supplierName(p.supplier_id) : (p.supplier || '-')}</td>
      <td class="pt-x">${(() => { const s = productStatus(p); const cls = s==='aktif'?'on':'off'; const label = s==='aktif'?'Aktif':'Di Arsipkan'; return `<span class="prod-status-badge ${cls}">${label}</span>`; })()}</td>
      <td class="pt-x">
        <div class="prod-aksi-row">
          <button class="prod-more-btn" onclick="openProductSheet('${p.id}')" aria-label="Lainnya">
            <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>
          </button>
          <button class="btn-edit" onclick="editProduct('${p.id}')">Edit</button>
        </div>
      </td>
    </tr>`;
    const variantRows = isOpen ? vars.map(v => {
      const low = (v.stock??0) <= LOW_STOCK_THRESHOLD;
      const inactive = v.is_active === false;
      const img = v.image_url || p.image_url;
      const vSold = variantSalesMap[v.id] || 0;
      return `
      <tr class="variant-row">
        ${selectModeOn?'<td></td>':''}
        <td>
          <div class="variant-sub-row">
            <div class="admin-product-img variant-sub-img">${img?`<img src="${img}"/>`:`<div style="width:100%;height:100%;background:#f0ede8"></div>`}</div>
            <div class="variant-sub-label">${v.color_name} · ${v.size}</div>
          </div>
        </td>
        <td></td>
        <td></td>
        <td>${v.original_price!=null?`<span class="prod-price-old">${fRp(v.original_price)}</span>`:''}<span class="prod-price-net">${fRp(v.price)}</span></td>
        <td class="prod-stock-num ${low?'variant-stock-low':''}">${v.stock??0}</td>
        <td class="prod-sold-num">${vSold}</td>
        <td></td>
        <td>${inactive?'<span class="badge-inactive">Nonaktif</span>':(low?'<span class="badge-lowstock">Menipis</span>':'')}</td>
        <td></td>
      </tr>`;
    }).join('') : '';
    return row + variantRows;
  }).join('');
  lastRenderedIds = list.map(p => p.id);
  updateBulkBar();
}

function toggleVariantBreakdown(id) {
  expandedProductId = (expandedProductId === id) ? null : id;
  renderAdminProductList();
}

function toggleBulkCheck(id, checked) {
  if (checked) bulkSelected.add(id); else bulkSelected.delete(id);
  updateBulkBar();
}
function clearBulkSelection() {
  bulkSelected.clear();
  renderAdminProductList();
}
function updateBulkBar() {
  const bar = document.getElementById('prod-bulkbar');
  if (!bar) return;
  bar.classList.toggle('hidden', bulkSelected.size === 0);
  document.getElementById('prod-bulk-count').textContent = `${bulkSelected.size} dipilih`;
}

let _confirmCallback = null;
function showConfirmDialog(message, onConfirm) {
  document.getElementById('confirm-message').textContent = message;
  _confirmCallback = onConfirm;
  document.getElementById('confirm-overlay').classList.add('open');
}
function closeConfirmDialog() {
  document.getElementById('confirm-overlay').classList.remove('open');
  _confirmCallback = null;
}
async function confirmDialogProceed() {
  const cb = _confirmCallback;
  document.getElementById('confirm-overlay').classList.remove('open');
  _confirmCallback = null;
  if (cb) await cb();
}

function extractStoragePath(url) {
  if (!url) return null;
  const marker = '/product-photos/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

async function deleteProductCascade(id) {
  const p = adminProductsData.find(x => x.id === id);
  const vars = p?.variants || [];
  const urls = new Set();
  (p?.image_urls || (p?.image_url ? [p.image_url] : [])).forEach(u => urls.add(u));
  vars.forEach(v => { if (v.image_url) urls.add(v.image_url); });
  const paths = [...urls].map(extractStoragePath).filter(Boolean);
  if (paths.length) {
    await sb.storage.from('product-photos').remove(paths);
  }
  await sb.from('wishlists').delete().eq('product_id', id);
  await sb.from('variants').delete().eq('product_id', id);
  await sb.from('products').delete().eq('id', id);
}

async function toggleActiveCurrent() {
  if (!editingProductId) return;
  const p = adminProductsData.find(x => x.id === editingProductId);
  if (!p) return;
  const isActive = productStatus(p) === 'aktif';
  const newStatus = isActive ? 'nonaktif' : 'aktif';
  await sb.from('products').update({status: newStatus, is_active: newStatus === 'aktif'}).eq('id', editingProductId);
  showToast(isActive ? 'Produk diarsipkan ✓' : 'Produk diaktifkan ✓');
  closeProductForm();
  loadAdminProducts();
}

async function deleteProductFromForm() {
  if (!editingProductId) return;
  showConfirmDialog('Yakin ingin menghapus produk ini?', async () => {
    await deleteProductCascade(editingProductId);
    showToast('Produk dihapus');
    closeProductForm();
    loadAdminProducts();
  });
}

function closeProductSheet() {
  document.getElementById('prod-sheet-overlay').classList.remove('open');
}

async function toggleProductActiveById(id) {
  const p = adminProductsData.find(x => x.id === id);
  if (!p) return;
  const isActive = productStatus(p) === 'aktif';
  const newStatus = isActive ? 'nonaktif' : 'aktif';
  await sb.from('products').update({status: newStatus, is_active: newStatus === 'aktif'}).eq('id', id);
  showToast(isActive ? 'Produk diarsipkan ✓' : 'Produk diaktifkan ✓');
  closeProductSheet();
  loadAdminProducts();
}

async function duplicateProduct(id) {
  const p = adminProductsData.find(x => x.id === id);
  if (!p) return;
  const dupBase = {
    name: p.name + ' (Copy)', category: p.category, category_id: p.category_id, gender: p.gender,
    supplier: p.supplier, supplier_id: p.supplier_id, description: p.description,
    bahan: p.bahan, tipe_cutting: p.tipe_cutting, ketebalan: p.ketebalan,
    motif: p.motif, dipakai_model: p.dipakai_model, image_url: p.image_url, image_urls: p.image_urls
  };
  const dupExtra = {
    seo_title: p.seo_title || null, seo_description: p.seo_description || null, image_alts: p.image_alts || null,
    lengan: p.lengan || null, gramasi_gsm: p.gramasi_gsm || null, lingkar_dada_cm: p.lingkar_dada_cm || null,
    panjang_cm: p.panjang_cm || null, perawatan: p.perawatan || null, weight_gram: p.weight_gram || null,
    pkg_length_cm: p.pkg_length_cm || null, pkg_width_cm: p.pkg_width_cm || null, pkg_height_cm: p.pkg_height_cm || null
  };
  const dres = await saveWithExtras(b => sb.from('products').insert(b).select().single(), dupBase, dupExtra);
  const newProd = dres.data, error = dres.error;
  if (error) { showToast('Gagal duplikat: ' + error.message); return; }
  const vars = (p.variants || []).map(v => ({
    product_id: newProd.id, color_name: v.color_name, color_hex: v.color_hex, size: v.size,
    price: v.price, original_price: v.original_price, stock: v.stock, image_url: v.image_url, is_active: v.is_active
  }));
  if (vars.length) await sb.from('variants').insert(vars);
  showToast('Produk berhasil diduplikat ✓');
  closeProductSheet();
  loadAdminProducts();
}

function deleteProductFromSheet(id) {
  showConfirmDialog('Yakin ingin menghapus produk ini?', async () => {
    await deleteProductCascade(id);
    showToast('Produk dihapus');
    closeProductSheet();
    loadAdminProducts();
  });
}

async function openProductSheet(id) {
  const p = adminProductsData.find(x => x.id === id);
  if (!p) return;
  const vars = p.variants || [];
  const netStr = priceRangeStr(vars, 'price') || '-';
  const stock = productTotalStock(p);
  const status = productStatus(p);

  document.getElementById('prod-sheet-overlay').classList.add('open');
  document.getElementById('prod-sheet-body').innerHTML = `
    <div style="display:flex;gap:12px;margin-bottom:16px">
      <div class="admin-product-img" style="width:60px;height:60px;flex-shrink:0">${p.image_url ? `<img src="${p.image_url}"/>` : ''}</div>
      <div>
        <div style="font-weight:600;font-size:14px;margin-bottom:2px">${p.name}</div>
        <div style="font-size:11.5px;color:var(--muted)">Kode Produk ${p.id.slice(0,8)}</div>
        <div style="font-size:13px;margin-top:2px">${netStr} · Stok ${stock}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
      <button class="btn-edit" onclick="seoShareProduct('${p.id}')">Bagikan</button>
      <button class="btn-edit" onclick="seoCopyProduct('${p.id}')">Salin link</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button class="btn-edit" onclick="toggleProductActiveById('${p.id}')">${status === 'aktif' ? 'Arsipkan' : 'Aktifkan'}</button>
      <button class="btn-edit" onclick="duplicateProduct('${p.id}')">Salin</button>
      <button class="btn-danger" style="grid-column:1/-1" onclick="deleteProductFromSheet('${p.id}')">Hapus</button>
    </div>
  `;
}

// ===================== TABEL UKURAN OTOMATIS DARI SPESIFIKASI =====================
function pfInsertSizeTable() {
  const ta = document.getElementById('p-desc');
  if (!ta) return;
  if (/^[ 	]*\|.*\|[ 	]*$/m.test(ta.value)) { 
    showToast('Tabel ukuran sudah ada di deskripsi'); 
    return; 
  }
  const val = id => { const el = document.getElementById(id); return el && String(el.value).trim() ? String(el.value).trim() : '-'; };
  const panjang = val('p-panjang');
  const dada = val('p-lingkar-dada');
  
  const block = 'Panduan Ukuran:\n' +
    '| Ukuran | Panjang Atasan (cm) | Lingkar Dada (cm) | Panjang Lengan (cm) |\n' +
    '| All Size | ' + panjang + ' | ' + dada + ' | - |';
    
  const pos = ta.selectionEnd != null && ta.value.length ? ta.selectionEnd : ta.value.length;
  const before = ta.value.slice(0, pos), after = ta.value.slice(pos);
  const pre = before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
  const post = after && !after.startsWith('\n') ? '\n\n' : (after ? '\n' : '');
  
  ta.value = before + pre + block + post + after;
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  ta.focus();
  showToast('Tabel ukuran berhasil disisipkan dari data spesifikasi ✓');
}
