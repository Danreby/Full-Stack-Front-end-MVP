document.addEventListener('DOMContentLoaded', () => {
  let employeeList = [];
  let pendingDeleteId = null;

  const tableBody = document.querySelector('#employeeTable tbody');
  const searchInput = document.getElementById('inputSearchEmployee');
  const addButton = document.getElementById('buttonAddEmployee');

  const allModals = document.querySelectorAll('.modal');
  const addModal = document.getElementById('modalAddEmployee');
  const addForm = document.getElementById('formAddEmployee');
  const editModal = document.getElementById('modalEditEmployee');
  const editForm = document.getElementById('formEditEmployee');
  const deleteModal = document.getElementById('modalDeleteEmployee');
  const confirmDeleteButton = document.getElementById('buttonConfirmDelete');

  function showModal(modalElement) {
    modalElement.classList.add('open');
  }

  function hideModal(modalElement) {
    modalElement.classList.remove('open');
  }

  document.querySelectorAll('[data-close]').forEach(button => {
    button.addEventListener('click', () => {
      const targetModal = document.getElementById(button.dataset.close);
      hideModal(targetModal);
    });
  });

  allModals.forEach(modalElement => {
    modalElement.addEventListener('click', event => {
      if (event.target === modalElement) {
        hideModal(modalElement);
      }
    });
  });

  function renderEmployeeTable(listToRender) {
    tableBody.innerHTML = '';

    listToRender.forEach(employee => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${employee.id}</td>
        <td>${employee.nome}</td>
        <td>${employee.departamento}</td>
        <td>${employee.email}</td>
        <td>
          <button class="btn-editar" data-id="${employee.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
              <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
            </svg>
          </button>
          <button class="btn-excluir" data-id="${employee.id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
            </svg>
          </button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  searchInput.addEventListener('input', () => {
    const filterText = searchInput.value.toLowerCase();
    const filteredEmployees = employeeList.filter(emp => emp.nome.toLowerCase().includes(filterText));
    renderEmployeeTable(filteredEmployees);
  });

  addButton.addEventListener('click', () => showModal(addModal));

  addForm.addEventListener('submit', event => {
    event.preventDefault();
    const newName = document.getElementById('inputAddName').value;
    const newDepartment = document.getElementById('inputAddDepartment').value;
    const newEmail = document.getElementById('inputAddEmail').value;

    employeeList.push({ id: Date.now(), nome: newName, departamento: newDepartment, email: newEmail });
    renderEmployeeTable(employeeList);
    addForm.reset();
    hideModal(addModal);
  });

  tableBody.addEventListener('click', event => {
    if (event.target.matches('.btn-editar')) {
      const employeeId = Number(event.target.dataset.id);
      const employeeToEdit = employeeList.find(emp => emp.id === employeeId);

      document.getElementById('inputEditId').value = employeeToEdit.id;
      document.getElementById('inputEditName').value = employeeToEdit.nome;
      document.getElementById('inputEditDepartment').value = employeeToEdit.departamento;
      document.getElementById('inputEditEmail').value = employeeToEdit.email;

      showModal(editModal);
    }
  });

  editForm.addEventListener('submit', event => {
    event.preventDefault();
    const editId = Number(document.getElementById('inputEditId').value);
    const employee = employeeList.find(emp => emp.id === editId);

    employee.nome = document.getElementById('inputEditName').value;
    employee.departamento = document.getElementById('inputEditDepartment').value;
    employee.email = document.getElementById('inputEditEmail').value;

    renderEmployeeTable(employeeList);
    hideModal(editModal);
  });

  tableBody.addEventListener('click', event => {
    if (event.target.matches('.btn-excluir')) {
      pendingDeleteId = Number(event.target.dataset.id);
      showModal(deleteModal);
    }
  });

  confirmDeleteButton.addEventListener('click', () => {
    employeeList = employeeList.filter(emp => emp.id !== pendingDeleteId);
    renderEmployeeTable(employeeList);
    hideModal(deleteModal);
  });

  renderEmployeeTable(employeeList);
});
