document.addEventListener('DOMContentLoaded', () => {
  const apiBaseUrl = 'http://localhost:5000';

  let employeeList = [];
  let sectorList = [];

  const tableBody       = document.querySelector('#employeeTable tbody');
  const searchInput     = document.getElementById('inputSearchEmployee');
  const addButton       = document.getElementById('buttonAddEmployee');
  const addSectorButton = document.getElementById('buttonAddSector');

  const addModal        = document.getElementById('modalAddEmployee');
  const addForm         = document.getElementById('formAddEmployee');
  const addSectorModal  = document.getElementById('modalAddSector');
  const addSectorForm   = document.getElementById('formAddSector');

  const addDeptSelect   = document.getElementById('inputAddDepartment');

  // Utilitários
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

  // Preenche o select de setores
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
      `;
      tableBody.appendChild(row);
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

  addButton.addEventListener('click', () => showModal(addModal));
  addSectorButton.addEventListener('click', () => showModal(addSectorModal));

  // CADASTRO DE FUNCIONÁRIO
  addForm.addEventListener('submit', async ev => {
    ev.preventDefault();

    const name     = document.getElementById('inputAddName').value.trim();
    const email    = document.getElementById('inputAddEmail').value.trim();
    const sectorId = parseInt(document.getElementById('inputAddDepartment').value, 10);

    const payload = { name, email, sector_id: sectorId };
    console.log('🔧 Enviando JSON:', payload);

    try {
    const formBody = new URLSearchParams();
      formBody.append('name', name);
      formBody.append('email', email);
      formBody.append('sector_id', sectorId);

      const response = await fetch(`${apiBaseUrl}/funcionarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formBody.toString()
      });

      const rawText = await response.text(); // debug
      console.log('📝 Resposta bruta:', rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        data = {};
      }

      console.log('📥 Resposta /funcionarios:', response.status, data);

      if (response.ok) {
        await fetchEmployees();
        addForm.reset();
        hideModal(addModal);
      } else if (response.status === 409) {
        alert(`Erro de integridade: ${data.message}`);
      } else if (response.status === 422) {
        console.error('Erro 422 detalhes:', data);
        alert('Erro 422: Requisição mal formatada. Verifique os campos.');
      } else {
        alert(`Erro ao criar funcionário (${response.status}): ${data.message || JSON.stringify(data.detail)}`);
      }
    } catch (err) {
      console.error('Erro ao enviar requisição:', err);
      alert('Erro inesperado ao cadastrar funcionário.');
    }
  });

  // CADASTRO DE SETOR
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

      const rawText = await response.text();
      console.log('📝 Resposta setor:', rawText);
      const data = JSON.parse(rawText);

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

  // Inicialização
  fetchSectors();
  fetchEmployees();
});
