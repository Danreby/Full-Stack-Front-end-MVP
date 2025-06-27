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
          <button class="btn-editar" data-id="${employee.id}">Editar</button>
          <button class="btn-excluir" data-id="${employee.id}">Excluir</button>
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
