document.addEventListener('DOMContentLoaded', () => {
  const apiBaseUrl = 'http://localhost:5000';

  let employeeList = [];
  let sectorList = [];
  let pendingDeleteId;
  let pendingDeleteResource; // 'funcionarios' ou 'sectors'
  let pendingSectorId; // para edição de setor

  const tableBody = document.querySelector('#employeeTable tbody');
  const sectorTableBody = document.querySelector('#sectorTable tbody');
  const searchInput = document.getElementById('inputSearchEmployee');
  const addButton = document.getElementById('buttonAddEmployee');
  const addSectorButton = document.getElementById('buttonAddSector');

  const addModal = document.getElementById('modalAddEmployee');
  const addForm = document.getElementById('formAddEmployee');
  const addSectorModal = document.getElementById('modalAddSector');
  const addSectorForm = document.getElementById('formAddSector');

  const addDeptSelect = document.getElementById('inputAddDepartment');
  const flashContainer = document.getElementById('flash-container');

  const confirmDeleteModal = document.getElementById('modalConfirmDelete');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  function showModal(m) { m.classList.add('open'); }
  function hideModal(m) { m.classList.remove('open'); }

  function showFlash(message, type = 'success') {
    const flash = document.createElement('div');
    flash.className = `flash flash-${type}`;
    flash.textContent = message;
    flashContainer.appendChild(flash);
    setTimeout(() => flash.classList.add('visible'), 10);
    setTimeout(() => flash.classList.remove('visible'), 3000);
    setTimeout(() => flash.remove(), 3500);
  }

  // Delete genérico
  async function deleteResource(resource, id, onSuccess, msg) {
    try {
      const res = await fetch(`${apiBaseUrl}/${resource}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Erro ao deletar ${resource}`);
      }
      showFlash(msg, 'success');
      await onSuccess();
    } catch (e) {
      console.error(`deleteResource ${resource}/${id}`, e);
      showFlash(e.message, 'error');
    }
  }

  const deleteEmployee = id => deleteResource('funcionarios', id, fetchEmployees, 'Funcionário deletado com sucesso!');
  const deleteSector = id => deleteResource('sectors', id, fetchSectors, 'Setor deletado com sucesso!');

  document.querySelectorAll('[data-close]').forEach(btn =>
    btn.addEventListener('click', () => {
      hideModal(document.getElementById(btn.dataset.close));
      pendingDeleteId = pendingDeleteResource = pendingSectorId = null;
    }))
  document.querySelectorAll('.modal').forEach(modal =>
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        hideModal(modal);
        pendingDeleteId = pendingDeleteResource = pendingSectorId = null;
      }
    }))

  function populateDeptSelect() {
    addDeptSelect.innerHTML = '';
    sectorList.forEach(sec => {
      const opt = document.createElement('option');
      opt.value = sec.id;
      opt.textContent = sec.name;
      addDeptSelect.appendChild(opt);
    });
  }

  function renderEmployeeTable(list) {
    tableBody.innerHTML = '';
    list.forEach(emp => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${emp.id}</td>
        <td>${emp.name}</td>
        <td>${emp.sector.name}</td>
        <td>${emp.email}</td>
        <td>
          <button class="btn-edit" data-id="${emp.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
              <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
            </svg>
          </button>
          <button class="btn-delete" data-id="${emp.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
            </svg>
          </button>
        </td>`;
      tableBody.appendChild(row);
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        pendingDeleteId = btn.dataset.id;
        pendingDeleteResource = 'funcionarios';
        showModal(confirmDeleteModal);
      });
    });
    document.querySelectorAll('.btn-edit').forEach(btn =>
      btn.addEventListener('click', () => editEmployee(btn.dataset.id)));
  }

  function renderSectorTable(list) {
    sectorTableBody.innerHTML = '';
    list.forEach(sec => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${sec.id}</td>
        <td>${sec.name}</td>
        <td>
          <button class="btn-sector-edit" data-id="${sec.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
              <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
            </svg>
          </button>
          <button class="btn-sector-delete" data-id="${sec.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
            </svg>
          </button>
        </td>`;
      sectorTableBody.appendChild(row);
    });
    document.querySelectorAll('.btn-sector-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        pendingDeleteId = btn.dataset.id;
        pendingDeleteResource = 'sectors';
        showModal(confirmDeleteModal);
      });
    });
    document.querySelectorAll('.btn-sector-edit').forEach(btn =>
      btn.addEventListener('click', () => {
        pendingSectorId = btn.dataset.id;
        const sec = sectorList.find(s => s.id == pendingSectorId);
        if (!sec) return;
        document.getElementById('inputAddSectorName').value = sec.name;
        showModal(addSectorModal);
      }));
  }

  searchInput.addEventListener('input', () => {
    const txt = searchInput.value.trim().toLowerCase();
    renderEmployeeTable(employeeList.filter(e => e.name.toLowerCase().includes(txt)));
  });

  async function fetchSectors() {
    try {
      const res = await fetch(`${apiBaseUrl}/sectors`);
      const data = await res.json();
      sectorList = data.sectors || [];
      populateDeptSelect();
      renderSectorTable(sectorList);
    } catch (e) {
      console.error('fetchSectors', e);
    }
  }

  async function fetchEmployees() {
    try {
      const res = await fetch(`${apiBaseUrl}/funcionarios`);
      const data = await res.json();
      employeeList = data.funcionarios || [];
      renderEmployeeTable(employeeList);
    } catch (e) {
      console.error('fetchEmployees', e);
    }
  }

  addButton.addEventListener('click', () => { resetFormHandler(); showModal(addModal); });
  addSectorButton.addEventListener('click', () => { 
    pendingSectorId = null;
    addSectorForm.reset();
    showModal(addSectorModal);
  });

  function resetFormHandler() {
    addForm.onsubmit = handleAddSubmit;
    addForm.reset();
  }

  async function handleAddSubmit(ev) {
    ev.preventDefault();
    const name = document.getElementById('inputAddName').value.trim();
    const email = document.getElementById('inputAddEmail').value.trim();
    const sectorId = parseInt(addDeptSelect.value, 10);
    const body = new URLSearchParams({ name, email, sector_id: sectorId });
    try {
      const res = await fetch(`${apiBaseUrl}/funcionarios`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
      const data = await res.json();
      if (res.ok) { showFlash('Funcionário criado com sucesso!', 'success'); hideModal(addModal); await fetchEmployees(); }
      else showFlash(data.message || 'Erro ao criar funcionário.', 'error');
    } catch { showFlash('Erro inesperado ao criar funcionário.', 'error'); }
  }

  confirmDeleteBtn.addEventListener('click', async () => {
    if (!pendingDeleteId || !pendingDeleteResource) return;
    hideModal(confirmDeleteModal);
    if (pendingDeleteResource === 'funcionarios') await deleteEmployee(pendingDeleteId);
    else if (pendingDeleteResource === 'sectors') await deleteSector(pendingDeleteId);
    pendingDeleteId = pendingDeleteResource = null;
  });

  function editEmployee(id) {
    const emp = employeeList.find(e => e.id == id);
    if (!emp) return;
    document.getElementById('inputAddName').value = emp.name;
    document.getElementById('inputAddEmail').value = emp.email;
    addDeptSelect.value = emp.sector.id;
    showModal(addModal);
    addForm.onsubmit = async ev => {
      ev.preventDefault();
      const name = document.getElementById('inputAddName').value.trim();
      const email = document.getElementById('inputAddEmail').value.trim();
      const sectorId = parseInt(addDeptSelect.value, 10);
      const body = new URLSearchParams({ name, email, sector_id: sectorId });
      try {
        const res = await fetch(`${apiBaseUrl}/funcionarios/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
        const data = await res.json();
        if (res.ok) { showFlash('Funcionário editado com sucesso!', 'success'); hideModal(addModal); await fetchEmployees(); }
        else showFlash(data.message || 'Erro ao editar funcionário.', 'error');
      } catch { showFlash('Erro inesperado ao editar funcionário.', 'error'); }
    };
  }

  addSectorForm.addEventListener('submit', async ev => {
    ev.preventDefault();
    const name = document.getElementById('inputAddSectorName').value.trim();
    if (!name) return showFlash('Informe um nome de setor.', 'error');
    const method = pendingSectorId ? 'PUT' : 'POST';
    const url = pendingSectorId ? `${apiBaseUrl}/sectors/${pendingSectorId}` : `${apiBaseUrl}/sectors`;
    const body = new URLSearchParams({ name });
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
      const data = await res.json();
      if (res.ok) {
        showFlash(`Setor ${pendingSectorId ? 'atualizado' : 'criado'} com sucesso!`, 'success');
        hideModal(addSectorModal); pendingSectorId = null; addSectorForm.reset(); await fetchSectors();
      } else showFlash(data.message || 'Erro ao salvar setor.', 'error');
    } catch { showFlash('Erro inesperado ao salvar setor.', 'error'); }
  });

  resetFormHandler();
  fetchSectors();
  fetchEmployees();
});
