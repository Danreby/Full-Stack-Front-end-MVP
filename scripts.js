document.addEventListener('DOMContentLoaded', () => {
  const apiBaseUrl = 'http://localhost:5000';

  let employeeList = [];
  let sectorList = [];

  const tableBody       = document.querySelector('#employeeTable tbody');
  const searchInput     = document.getElementById('inputSearchEmployee');
  const addButton       = document.getElementById('buttonAddEmployee');
  const addSectorButton = document.getElementById('buttonAddSector');

  const addModal        = document.getElementById('modalAddEmployee');
  let addForm           = document.getElementById('formAddEmployee');
  const addSectorModal  = document.getElementById('modalAddSector');
  const addSectorForm   = document.getElementById('formAddSector');

  const addDeptSelect   = document.getElementById('inputAddDepartment');

  // helpers para abrir/fechar modal
  function showModal(m) { m.classList.add('open'); }
  function hideModal(m) { m.classList.remove('open'); }

  document.querySelectorAll('[data-close]').forEach(btn =>
    btn.addEventListener('click', () =>
      hideModal(document.getElementById(btn.dataset.close))
    )
  );

  document.querySelectorAll('.modal').forEach(modal =>
    modal.addEventListener('click', e => {
      if (e.target === modal) hideModal(modal);
    })
  );

  // popula <select> de setores
  function populateDeptSelect() {
    addDeptSelect.innerHTML = '';
    sectorList.forEach(sector => {
      const opt = document.createElement('option');
      opt.value = sector.id;
      opt.textContent = sector.name;
      addDeptSelect.appendChild(opt);
    });
  }

  // renderiza tabela de funcionários
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

    // vincula botões de excluir
    document.querySelectorAll('.btn-delete').forEach(button => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        if (confirm('Tem certeza que deseja excluir este funcionário?')) {
          await deleteEmployee(id);
        }
      });
    });

    // vincula botões de editar
    document.querySelectorAll('.btn-edit').forEach(button => {
      button.addEventListener('click', () => {
        editEmployee(button.dataset.id);
      });
    });
  }

  // busca todos os funcionários
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

  // busca todos os setores
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

  // filtro de busca
  searchInput.addEventListener('input', () => {
    const txt = searchInput.value.toLowerCase();
    renderEmployeeTable(
      employeeList.filter(e => e.name.toLowerCase().includes(txt))
    );
  });

  // abrir modal de adicionar
  addButton.addEventListener('click', () => {
    resetFormHandler();
    showModal(addModal);
  });

  // abrir modal de adicionar setor
  addSectorButton.addEventListener('click', () => showModal(addSectorModal));

  // configura o form para o modo "Add" e limpa campos
  function resetFormHandler() {
    addForm.onsubmit = handleAddSubmit;
    addForm.reset();
  }

  // handler para POST /funcionarios
  async function handleAddSubmit(ev) {
    ev.preventDefault();

    const name     = document.getElementById('inputAddName').value.trim();
    const email    = document.getElementById('inputAddEmail').value.trim();
    const sectorId = parseInt(addDeptSelect.value, 10);

    const formBody = new URLSearchParams({ name, email, sector_id: sectorId });

    try {
      const response = await fetch(`${apiBaseUrl}/funcionarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formBody.toString()
      });

      const data = await response.json();
      if (response.ok) {
        await fetchEmployees();
        hideModal(addModal);
      } else {
        alert(`Erro (${response.status}): ${data.message}`);
      }
    } catch (err) {
      console.error('Erro ao cadastrar funcionário:', err);
      alert('Erro inesperado ao cadastrar funcionário.');
    }
  }

  // handler para DELETE /funcionarios/:id
  async function deleteEmployee(id) {
    try {
      const response = await fetch(`${apiBaseUrl}/funcionarios/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        alert('Funcionário excluído com sucesso.');
        await fetchEmployees();
      } else {
        alert(`Erro ao excluir: ${response.status}`);
      }
    } catch (err) {
      console.error('Erro ao excluir funcionário:', err);
    }
  }

  // configura o form para o modo "Edit" e faz PUT /funcionarios/:id
  function editEmployee(id) {
    const employee = employeeList.find(e => e.id == id);
    if (!employee) return;

    // preenche modal com dados existentes
    document.getElementById('inputAddName').value       = employee.name;
    document.getElementById('inputAddEmail').value      = employee.email;
    addDeptSelect.value                                 = employee.sector.id;

    showModal(addModal);

    // sobrescreve onsubmit para usar PUT
    addForm.onsubmit = async ev => {
      ev.preventDefault();

      const name     = document.getElementById('inputAddName').value.trim();
      const email    = document.getElementById('inputAddEmail').value.trim();
      const sectorId = parseInt(addDeptSelect.value, 10);

      const formBody = new URLSearchParams({ name, email, sector_id: sectorId });

      try {
        const response = await fetch(`${apiBaseUrl}/funcionarios/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: formBody.toString()
        });

        if (response.ok) {
          alert('Funcionário atualizado com sucesso.');
          hideModal(addModal);
          await fetchEmployees();
        } else {
          const data = await response.json();
          alert(`Erro (${response.status}): ${data.message || response.statusText}`);
        }
      } catch (err) {
        console.error('Erro ao editar funcionário:', err);
        alert('Erro inesperado ao editar funcionário.');
      }
    };
  }

  // configura form padrão e faz carregamento inicial
  resetFormHandler();
  fetchSectors();
  fetchEmployees();
});
