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

  function populateDeptSelect() {
    addDeptSelect.innerHTML = '';
    sectorList.forEach(sector => {
      const opt = document.createElement('option');
      opt.value = sector.id;
      opt.textContent = sector.name;
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
          <button class="btn-edit" data-id="${emp.id}">Editar</button>
          <button class="btn-delete" data-id="${emp.id}">Excluir</button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    document.querySelectorAll('.btn-delete').forEach(button => {
      button.addEventListener('click', async () => {
        const id = button.dataset.id;
        if (confirm('Tem certeza que deseja excluir este funcionário?')) {
          await deleteEmployee(id);
        }
      });
    });

    document.querySelectorAll('.btn-edit').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.dataset.id;
        editEmployee(id);
      });
    });
  }

  async function fetchEmployees() {
    try {
      const res = await fetch(`${apiBaseUrl}/funcionarios`);
      const data = await res.json();
      employeeList = data.funcionarios || [];
      renderEmployeeTable(employeeList);
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
    }
  }

  async function fetchSectors() {
    try {
      const res = await fetch(`${apiBaseUrl}/sectors`);
      const data = await res.json();
      sectorList = data.sectors || [];
      populateDeptSelect();
    } catch (err) {
      console.error('Erro ao buscar setores:', err);
    }
  }

  searchInput.addEventListener('input', () => {
    const txt = searchInput.value.toLowerCase();
    renderEmployeeTable(
      employeeList.filter(e => e.name.toLowerCase().includes(txt))
    );
  });

  addButton.addEventListener('click', () => {
    resetFormHandler();
    showModal(addModal);
  });

  addSectorButton.addEventListener('click', () => showModal(addSectorModal));

  function resetFormHandler() {
    addForm.onsubmit = handleAddSubmit;
    addForm.reset();
  }

  async function handleAddSubmit(ev) {
    ev.preventDefault();

    const name = document.getElementById('inputAddName').value.trim();
    const email = document.getElementById('inputAddEmail').value.trim();
    const sectorId = parseInt(document.getElementById('inputAddDepartment').value, 10);

    const formBody = new URLSearchParams();
    formBody.append('name', name);
    formBody.append('email', email);
    formBody.append('sector_id', sectorId);

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

  function editEmployee(id) {
    const employee = employeeList.find(e => e.id == id);
    if (!employee) return;

    document.getElementById('inputAddName').value = employee.name;
    document.getElementById('inputAddEmail').value = employee.email;
    document.getElementById('inputAddDepartment').value = employee.sector.id;

    showModal(addModal);

    addForm.onsubmit = async ev => {
      ev.preventDefault();

      const name = document.getElementById('inputAddName').value.trim();
      const email = document.getElementById('inputAddEmail').value.trim();
      const sectorId = parseInt(document.getElementById('inputAddDepartment').value, 10);

      const formBody = new URLSearchParams();
      formBody.append('name', name);
      formBody.append('email', email);
      formBody.append('sector_id', sectorId);

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
          alert(`Erro ao atualizar funcionário: ${response.status}`);
        }
      } catch (err) {
        console.error('Erro ao editar funcionário:', err);
      }
    };
  }

  addForm.addEventListener('submit', handleAddSubmit);

  addSectorForm.addEventListener('submit', async ev => {
    ev.preventDefault();
    const name = document.getElementById('inputAddSectorName').value.trim();
    if (!name) return alert('Informe um nome de setor válido.');

    const formBody = new URLSearchParams();
    formBody.append('name', name);

    try {
      const response = await fetch(`${apiBaseUrl}/sectors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: formBody.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchSectors();
        addSectorForm.reset();
        hideModal(addSectorModal);
      } else {
        alert(`Erro (${response.status}): ${data.message}`);
      }
    } catch (err) {
      console.error('Erro ao criar setor:', err);
      alert('Erro inesperado ao criar setor.');
    }
  });

  fetchSectors();
  fetchEmployees();
});
