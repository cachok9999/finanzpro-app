// Categories Management Component (CRUD for Expense and Income Categories)
import { store } from '../state.js';

const AVAILABLE_ICONS = [
  'shopping-cart', 'utensils', 'home', 'car', 'zap', 'heart-pulse', 'shield-check',
  'film', 'shopping-bag', 'plane', 'dumbbell', 'trending-up', 'credit-card', 'piggy-bank',
  'briefcase', 'laptop', 'line-chart', 'gift', 'coffee', 'book', 'graduation-cap',
  'baby', 'dog', 'wrench', 'music', 'gamepad-2', 'wifi', 'smartphone', 'sparkles'
];

const AVAILABLE_COLORS = [
  '#6366F1', '#10B981', '#F43F5E', '#F59E0B', '#06B6D4', '#8B5CF6',
  '#EC4899', '#3B82F6', '#14B8A6', '#E11D48', '#84CC16', '#64748B'
];

let activeTab = 'expense'; // expense | income
let selectedIcon = 'tag';
let selectedColor = '#6366F1';

export function renderCategories(container) {
  const state = store.getState();
  const filteredCategories = state.categories.filter(c => c.type === activeTab);

  container.innerHTML = `
    <div class="space-y-4 pb-24 animate-fadeIn">
      
      <!-- Top Title & Add Category -->
      <div class="flex items-center justify-between pt-2 px-1">
        <div>
          <span class="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Personalización</span>
          <h1 class="text-2xl font-extrabold text-slate-100">Categorías</h1>
        </div>
        <button id="btn-add-category" class="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95">
          <i data-lucide="plus" class="w-4 h-4"></i> Nueva
        </button>
      </div>

      <!-- Expense / Income Tabs -->
      <div class="grid grid-cols-2 gap-2 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs">
        <button data-tab="expense" class="cat-tab-btn py-2.5 rounded-xl font-bold transition ${activeTab === 'expense' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
          Categorías de Gasto (${state.categories.filter(c => c.type === 'expense').length})
        </button>
        <button data-tab="income" class="cat-tab-btn py-2.5 rounded-xl font-bold transition ${activeTab === 'income' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}">
          Categorías de Ingreso (${state.categories.filter(c => c.type === 'income').length})
        </button>
      </div>

      <!-- Categories List -->
      <div class="space-y-2.5 pt-1">
        ${filteredCategories.map(cat => {
          const txCount = state.transactions.filter(t => t.categoryId === cat.id).length;
          
          let bucketBadge = '';
          if (cat.type === 'expense') {
            if (cat.bucket === 'needs') bucketBadge = '<span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold">Necesidad (50%)</span>';
            else if (cat.bucket === 'wants') bucketBadge = '<span class="px-2 py-0.5 rounded-md bg-pink-500/20 text-pink-300 text-[10px] font-bold">Deseo (30%)</span>';
            else if (cat.bucket === 'savings') bucketBadge = '<span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Ahorro / Inversión (20%)</span>';
          }

          return `
            <div class="card-elevated p-3.5 bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm" style="background: ${cat.color}25; color: ${cat.color}">
                  <i data-lucide="${cat.icon || 'tag'}" class="w-5 h-5"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="text-xs font-bold text-slate-100">${cat.name}</h4>
                    ${bucketBadge}
                  </div>
                  <span class="text-[11px] text-slate-400 mt-0.5 block">${txCount} movimiento${txCount !== 1 ? 's' : ''} registrado${txCount !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button data-delete-cat="${cat.id}" class="btn-del-cat p-1.5 text-slate-500 hover:text-rose-400 rounded-lg" title="Eliminar Categoría">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>

    <!-- Modal Form for New Category -->
    <div id="modal-new-category" class="bottom-sheet-backdrop">
      <div class="bottom-sheet p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="text-base font-extrabold text-white flex items-center gap-2">
            <i data-lucide="folder-plus" class="w-5 h-5 text-indigo-400"></i> Crear Nueva Categoría
          </h3>
          <button id="btn-close-cat-modal" class="p-1 text-slate-400 hover:text-white">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <!-- Name Input -->
          <div>
            <label class="block font-bold text-slate-300 mb-1">Nombre de la Categoría</label>
            <input id="new-cat-name" type="text" placeholder="Ej: Mascotas, Gimnasio, Criptomonedas, Dividendos..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-indigo-500" />
          </div>

          <!-- Type (Expense / Income) -->
          <div>
            <label class="block font-bold text-slate-300 mb-1">Tipo de Flujo</label>
            <div class="grid grid-cols-2 gap-2">
              <label class="flex items-center gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                <input type="radio" name="new-cat-type-radio" value="expense" ${activeTab === 'expense' ? 'checked' : ''} class="text-rose-500">
                <span class="font-bold text-rose-400">Gasto</span>
              </label>
              <label class="flex items-center gap-2 p-2.5 bg-slate-900 rounded-xl border border-slate-800 cursor-pointer">
                <input type="radio" name="new-cat-type-radio" value="income" ${activeTab === 'income' ? 'checked' : ''} class="text-emerald-500">
                <span class="font-bold text-emerald-400">Ingreso</span>
              </label>
            </div>
          </div>

          <!-- 50/30/20 Bucket (Only for Expenses) -->
          <div id="bucket-selection-box">
            <label class="block font-bold text-slate-300 mb-1">Clasificación en Regla 50/30/20</label>
            <select id="new-cat-bucket" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none">
              <option value="needs">🏠 Necesidades Básicas (50%) - Ej: Alquiler, despensa, luz</option>
              <option value="wants" selected>🎉 Deseos y Estilo de Vida (30%) - Ej: Salidas, ropa, cine</option>
              <option value="savings">📈 Ahorro, Inversión o Deuda (20%) - Ej: Bolsa, fondo, cuotas</option>
            </select>
          </div>

          <!-- Color Palette Picker -->
          <div>
            <label class="block font-bold text-slate-300 mb-1.5">Color Temático</label>
            <div class="flex items-center gap-2 overflow-x-auto pb-1">
              ${AVAILABLE_COLORS.map(color => `
                <div data-color="${color}" class="color-picker-dot w-7 h-7 rounded-full shrink-0 cursor-pointer transition border-2 ${color === selectedColor ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80'}" style="background-color: ${color}"></div>
              `).join('')}
            </div>
          </div>

          <!-- Icon Selector Grid -->
          <div>
            <label class="block font-bold text-slate-300 mb-1.5">Icono Representativo</label>
            <div class="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950/80 rounded-2xl border border-slate-800">
              ${AVAILABLE_ICONS.map(icon => `
                <div data-icon="${icon}" class="icon-picker-item p-2 rounded-xl flex items-center justify-center cursor-pointer transition border ${icon === selectedIcon ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'}">
                  <i data-lucide="${icon}" class="w-4 h-4"></i>
                </div>
              `).join('')}
            </div>
          </div>

          <button id="btn-save-new-category" type="button" class="w-full py-3.5 mt-2 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-95 transition">
            Guardar Categoría
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach Tab switcher
  container.querySelectorAll('.cat-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeTab = e.currentTarget.dataset.tab;
      renderCategories(container);
    });
  });

  // Modal Handlers
  const modal = container.querySelector('#modal-new-category');
  const sheet = modal.querySelector('.bottom-sheet');
  const btnAdd = container.querySelector('#btn-add-category');
  const btnClose = container.querySelector('#btn-close-cat-modal');

  if (btnAdd && modal) {
    btnAdd.addEventListener('click', () => {
      selectedIcon = 'tag';
      selectedColor = activeTab === 'income' ? '#10B981' : '#6366F1';
      modal.classList.add('active');
      sheet.classList.add('active');
      setTimeout(() => {
        container.querySelector('#new-cat-name').focus();
      }, 100);
    });
  }

  const closeModal = () => {
    modal.classList.remove('active');
    sheet.classList.remove('active');
  };

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Radio listener for type
  container.querySelectorAll('input[name="new-cat-type-radio"]').forEach(r => {
    r.addEventListener('change', (e) => {
      const bucketBox = container.querySelector('#bucket-selection-box');
      if (e.target.value === 'income') {
        bucketBox.style.display = 'none';
      } else {
        bucketBox.style.display = 'block';
      }
    });
  });

  // Color picker selection
  container.querySelectorAll('.color-picker-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      selectedColor = e.currentTarget.dataset.color;
      container.querySelectorAll('.color-picker-dot').forEach(d => {
        d.classList.remove('border-white', 'scale-110', 'shadow-lg');
        d.classList.add('border-transparent', 'opacity-80');
      });
      dot.classList.remove('border-transparent', 'opacity-80');
      dot.classList.add('border-white', 'scale-110', 'shadow-lg');
    });
  });

  // Icon picker selection
  container.querySelectorAll('.icon-picker-item').forEach(item => {
    item.addEventListener('click', (e) => {
      selectedIcon = e.currentTarget.dataset.icon;
      container.querySelectorAll('.icon-picker-item').forEach(i => {
        i.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-400');
        i.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
      });
      item.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');
      item.classList.add('bg-indigo-600', 'text-white', 'border-indigo-400');
    });
  });

  // Save new category
  const btnSave = container.querySelector('#btn-save-new-category');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const name = container.querySelector('#new-cat-name').value.trim();
      const type = container.querySelector('input[name="new-cat-type-radio"]:checked').value;
      const bucket = type === 'income' ? 'income' : container.querySelector('#new-cat-bucket').value;

      if (!name) {
        alert('Por favor ingresa un nombre para la categoría.');
        return;
      }

      store.addCategory({
        name,
        type,
        bucket,
        icon: selectedIcon,
        color: selectedColor
      });

      closeModal();
      activeTab = type;
      if (window.showToast) window.showToast(`✅ Categoría "${name}" creada con éxito`);
      renderCategories(container);
    });
  }

  // Delete Category
  container.querySelectorAll('.btn-del-cat').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.deleteCat;
      const cat = state.categories.find(c => c.id === id);
      if (confirm(`¿Deseas eliminar la categoría "${cat?.name || ''}"?`)) {
        store.deleteCategory(id);
        if (window.showToast) window.showToast('Categoría eliminada');
        renderCategories(container);
      }
    });
  });

  if (window.lucide) {
    window.lucide.createIcons({ root: container });
  }
}
