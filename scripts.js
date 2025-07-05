document.addEventListener('DOMContentLoaded', () => {
  const apiBaseUrl = 'http://localhost:5000';

  let employeeList      = [];
  let sectorList        = [];
  let pendingDeleteId;             // Guarda ID do funcionário a deletar

  const tableBody        = document.querySelector('#employeeTable tbody');
  const searchInput      = document.getElementById('inputSearchEmployee');
  const addButton        = document.getElementById('buttonAddEmployee');
  const addSectorButton  = document.getElementById('buttonAddSector');

  const addModal         = document.getElementById('modalAddEmployee');
  const addForm          = document.getElementById('formAddEmployee');
  const addSectorModal   = document.getElementById('modalAddSector');
  const addSectorForm    = document.getElementById('formAddSector');

  const addDeptSelect    = document.getElementById('inputAddDepartment');
  const flashContainer   = document.getElementById('flash-container');

  // Novo modal de confirmação de delete
  const confirmDeleteModal = document.getElementById('modalConfirmDelete');
  const confirmDeleteBtn   = document.getElementById('confirmDeleteBtn');

  // Helpers de modal
  function showModal(m) { m.classList.add('open'); }
  function hideModal(m) { m.classList.remove('open'); }

  // Flash cards
  function showFlash(message, type = 'success') {
    const flash = document.createElement('div');
    flash.className = `flash flash-${type}`;
    flash.textContent = message;
    flashContainer.appendChild(flash);
    setTimeout(() => flash.classList.add('visible'), 10);
    setTimeout(() => flash.classList.remove('visible'), 3000);
    setTimeout(() => flash.remove(), 3500);
  }

  // Fecha modais ao clicar em [x] ou fora
  document.querySelectorAll('[data-close]').forEach(btn =>
    btn.addEventListener('click', () => {
      const modal = document.getElementById(btn.dataset.close);
      hideModal(modal);
      pendingDeleteId = null;
    })
  );
  document.querySelectorAll('.modal').forEach(modal =>
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        hideModal(modal);
        pendingDeleteId = null;
      }
    })
  );

  // Popula select de setores
  function populateDeptSelect() {
    addDeptSelect.innerHTML = '';
    sectorList.forEach(sec => {
      const opt = document.createElement('option');
      opt.value = sec.id;
      opt.textContent = sec.name;
      addDeptSelect.appendChild(opt);
    });
  }

  // Renderiza tabela de funcionários
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
          <button class="btn-edit" data-id="${emp.id}">Editar</button>
          <button class="btn-delete" data-id="${emp.id}">Excluir</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    // Botões de excluir agora abrem o modal de confirmação
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        pendingDeleteId = btn.dataset.id;
        showModal(confirmDeleteModal);
      });
    });

    // Botões de editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => editEmployee(btn.dataset.id));
    });
  }

  // FILTRO POR NOME
  searchInput.addEventListener('input', () => {
    const txt      = searchInput.value.trim().toLowerCase();
    const filtered = employeeList.filter(e =>
      e.name.toLowerCase().includes(txt)
    );
    renderEmployeeTable(filtered);
  });

  // Fetch setores
  async function fetchSectors() {
    try {
      const res  = await fetch(`${apiBaseUrl}/sectors`);
      const data = await res.json();
      sectorList = data.sectors || [];
      populateDeptSelect();
    } catch (err) {
      console.error('Erro ao buscar setores:', err);
    }
  }

  // Fetch funcionários
  async function fetchEmployees() {
    try {
      const res  = await fetch(`${apiBaseUrl}/funcionarios`);
      const data = await res.json();
      employeeList = data.funcionarios || [];
      renderEmployeeTable(employeeList);
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
    }
  }

  // abrir modal de adicionar
  addButton.addEventListener('click', () => {
    resetFormHandler();
    showModal(addModal);
  });

  // abrir modal de adicionar setor
  addSectorButton.addEventListener('click', () => showModal(addSectorModal));
  
  // Configura form para "Add"
  function resetFormHandler() {
    addForm.onsubmit = handleAddSubmit;
    addForm.reset();
  }

  // Handler POST /funcionarios
  async function handleAddSubmit(ev) {
    ev.preventDefault();
    const name     = document.getElementById('inputAddName').value.trim();
    const email    = document.getElementById('inputAddEmail').value.trim();
    const sectorId = parseInt(addDeptSelect.value, 10);
    const body     = new URLSearchParams({ name, email, sector_id: sectorId });

    try {
      const res  = await fetch(`${apiBaseUrl}/funcionarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      const data = await res.json();
      if (res.ok) {
        showFlash('Funcionário criado com sucesso!', 'success');
        hideModal(addModal);
        await fetchEmployees();
      } else {
        showFlash(data.message || 'Erro ao criar funcionário.', 'error');
      }
    } catch (err) {
      showFlash('Erro inesperado ao criar funcionário.', 'error');
    }
  }

  // DELETE /funcionarios/:id
  async function deleteEmployee(id) {
    try {
      const res = await fetch(`${apiBaseUrl}/funcionarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showFlash('Funcionário deletado.', 'success');
        await fetchEmployees();
      } else {
        showFlash('Erro ao deletar funcionário.', 'error');
      }
    } catch {
      showFlash('Erro inesperado ao deletar funcionário.', 'error');
    }
  }

  // Confirmação de delete: chama a função após clicar
  confirmDeleteBtn.addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    hideModal(confirmDeleteModal);
    await deleteEmployee(pendingDeleteId);
    pendingDeleteId = null;
  });

  // Editar funcionário (PUT)
  function editEmployee(id) {
    const emp = employeeList.find(e => e.id == id);
    if (!emp) return;

    document.getElementById('inputAddName').value  = emp.name;
    document.getElementById('inputAddEmail').value = emp.email;
    addDeptSelect.value                            = emp.sector.id;
    showModal(addModal);

    addForm.onsubmit = async ev => {
      ev.preventDefault();
      const name     = document.getElementById('inputAddName').value.trim();
      const email    = document.getElementById('inputAddEmail').value.trim();
      const sectorId = parseInt(addDeptSelect.value, 10);
      const body     = new URLSearchParams({ name, email, sector_id: sectorId });

      try {
        const res  = await fetch(`${apiBaseUrl}/funcionarios/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString()
        });
        const data = await res.json();
        if (res.ok) {
          showFlash('Funcionário editado com sucesso!', 'success');
          hideModal(addModal);
          await fetchEmployees();
        } else {
          showFlash(data.message || 'Erro ao editar funcionário.', 'error');
        }
      } catch {
        showFlash('Erro inesperado ao editar funcionário.', 'error');
      }
    };
  }

  // Criar setor (POST)
  addSectorForm.addEventListener('submit', async ev => {
    ev.preventDefault();
    const name = document.getElementById('inputAddSectorName').value.trim();
    if (!name) return showFlash('Informe um nome de setor.', 'error');
    const body = new URLSearchParams({ name });

    try {
      const res  = await fetch(`${apiBaseUrl}/sectors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });
      const data = await res.json();
      if (res.ok) {
        showFlash('Setor criado com sucesso!', 'success');
        hideModal(addSectorModal);
        addSectorForm.reset();
        await fetchSectors();
      } else {
        showFlash(data.message || 'Erro ao criar setor.', 'error');
      }
    } catch {
      showFlash('Erro inesperado ao criar setor.', 'error');
    }
  });

  // Inicialização
  resetFormHandler();
  fetchSectors();
  fetchEmployees();
});
