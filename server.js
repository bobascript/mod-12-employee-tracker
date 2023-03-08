const db = require('./db/connection');
require('console.table');
const inquirer = require('inquirer');
const utils = require('util');
db.query = utils.promisify(db.query);

const mainMenu = [
  {
    name: 'mainMenu',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Delete a department',
      'Delete a role',
      'Delete an employee',
      'Quit',
    ],
  },
];

function init() {
  inquirer.prompt(mainMenu).then((response) => {
    if (response.mainMenu === 'View all departments') {
      viewDepartments();
    } else if (response.mainMenu === 'View all roles') {
      viewRoles();
    } else if (response.mainMenu === 'View all employees') {
      viewEmployees();
    } else if (response.mainMenu === 'Add a department') {
      createDepartment();
    } else if (response.mainMenu === 'Add a role') {
      createRole();
    } else if (response.mainMenu === 'Add an employee') {
      createEmployee();
    } else if (response.mainMenu === 'Update an employee role') {
      updateRole();
    } else if (response.mainMenu === 'Delete a department') {
      deleteDepartment();
    } else if (response.mainMenu === 'Delete a role') {
      deleteRole();
    } else if (response.mainMenu === 'Delete an employee') {
      deleteEmployee();
    } else {
      process.exit();
    }
  });
}

init();

function viewDepartments() {
  db.query(
    'SELECT name, id FROM department',
    (departmentError, departmentResults) => {
      if (departmentError) {
        console.log('Error with Department Query');
      }
      console.table(departmentResults);
      init();
    }
  );
}

function viewRoles() {
  db.query(
    'SELECT title, role.id, name AS department_name, salary FROM role JOIN department ON role.department_id = department.id',
    (roleErr, roleResults) => {
      if (roleErr) {
        console.log('Error with Role Query');
      }
      console.table(roleResults);
      init();
    }
  );
}

function viewEmployees() {
  db.query(
    "SELECT employee.id, CONCAT(first_name, ' ', last_name) AS employee_name, title, name AS department_name, salary, manager_id FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id",
    (employeeErr, employeeResults) => {
      if (employeeErr) {
        console.log('Error with Employee Query');
      }
      console.table(employeeResults);
      init();
    }
  );
}

function createDepartment() {
  const addDepartment = [
    {
      name: 'addDepartment',
      type: 'input',
      message: 'Which department would you like to add?',
    },
  ];
  inquirer.prompt(addDepartment).then((response) => {
    db.query(
      `INSERT INTO department (name) VALUES ("${response.addDepartment}");`
    );
    db.query(
      'SELECT name, id FROM department',
      (departmentError, departmentResults) => {
        if (departmentError) {
          console.log('Error with Deparment Query');
        }
        console.table(departmentResults);
        console.log(`${response.addDepartment} department successfully added!`);
        init();
      }
    );
  });
}

function createRole() {
  db.query('SELECT * FROM department', (departmentError, departmentResults) => {
    if (departmentError) {
      console.log('Error with Department Query');
    }
    let departments = departmentResults.map(({ id, name }) => ({
      value: id,
      name: `${id} ${name}`,
    }));
    let departmentsArray = [];
    for (let i = 0; i < departments.length; i++) {
      departmentsArray.push(departments[i].name);
    }
    const addRole = [
      {
        name: 'roleName',
        type: 'input',
        message: 'What is the name of the Role would you like to add?',
      },
      {
        name: 'roleSalary',
        type: 'input',
        message: 'What is the salary of the role?',
      },
      {
        name: 'roleDepartment',
        type: 'list',
        message: 'In which department does the role belong?',
        choices: departmentsArray,
      },
    ];
    inquirer.prompt(addRole).then((response) => {
      let departmendIdString = response.roleDepartment;
      let departmentIdArray = departmendIdString.split(' ');
      db.query(
        `INSERT INTO role (title, salary, department_id) VALUES ("${response.roleName}", "${response.roleSalary}", "${departmentIdArray[0]}");`
      );
      db.query(
        'SELECT title, role.id, name AS department_name, salary FROM role JOIN department ON role.department_id = department.id',
        (roleErr, roleResults) => {
          if (roleErr) {
            console.log('Error with Role Query');
          }
          console.table(roleResults);
          console.log(`${response.roleName} role successfully added!`);
          init();
        }
      );
    });
  });
}

function createEmployee() {
  db.query('SELECT * FROM role', (roleErr, roleResults) => {
    if (roleErr) {
      console.log('Error with Role Query');
    }
    let roles = roleResults.map(({ id, title }) => ({
      value: id,
      name: `${id} ${title}`,
    }));
    let rolesArray = [];
    db.query('SELECT * FROM employee', (employeeErr, employeeResults) => {
      if (employeeErr) {
        console.log('Error with Employee Query');
      }
      let employees = employeeResults.map(({ id, first_name, last_name }) => ({
        value: id,
        name: `${id} ${first_name} ${last_name}`,
      }));
      let employeesArray = [];
      for (let i = 0; i < roles.length; i++) {
        rolesArray.push(roles[i].name);
      }
      for (let j = 0; j < employees.length; j++) {
        employeesArray.push(employees[j].name);
      }
      const addEmployee = [
        {
          name: 'employeeFirstName',
          type: 'input',
          message: 'What is the First Name of the employee?',
        },
        {
          name: 'employeeLastName',
          type: 'input',
          message: 'What is the Last Name of the employee?',
        },
        {
          name: 'employeeRole',
          type: 'list',
          message: 'What is the role of the employee?',
          choices: rolesArray,
        },
        {
          name: 'employeeManager',
          type: 'list',
          message: 'To whom does the employee report?',
          choices: employeesArray,
        },
      ];
      inquirer.prompt(addEmployee).then((response) => {
        let roleIdString = response.employeeRole;
        let roleIdArray = roleIdString.split(' ');
        let managerIdString = response.employeeManager;
        let managerIdArray = managerIdString.split(' ');
        db.query(
          `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${response.employeeFirstName}", "${response.employeeLastName}", "${roleIdArray[0]}", "${managerIdArray[0]}");`
        );
        db.query(
          "SELECT employee.id, CONCAT(first_name, ' ', last_name) AS employee_name, title, name AS department_name, salary, manager_id FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id",
          (employeeErr, employeeResults) => {
            if (employeeErr) {
              console.log('Error with Employee Query');
            }
            console.table(employeeResults);
            console.log(
              `Employee ${response.employeeFirstName} ${response.employeeLastName} has been successfully added!`
            );
            init();
          }
        );
      });
    });
  });
}

function updateRole() {
  db.query('SELECT * FROM employee', (employeeErr, employeeResults) => {
    if (employeeErr) {
      console.log('Error with Employee Query');
    }
    let employees = employeeResults.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${id} ${first_name} ${last_name}`,
    }));
    let employeesArray = [];
    db.query('SELECT * FROM role', (roleErr, roleResults) => {
      if (roleErr) {
        console.log('Error with Role Query');
      }
      let roles = roleResults.map(({ id, title }) => ({
        value: id,
        name: `${id} ${title}`,
      }));
      let rolesArray = [];
      for (let i = 0; i < employees.length; i++) {
        employeesArray.push(employees[i].name);
      }
      for (let j = 0; j < roles.length; j++) {
        rolesArray.push(roles[j].name);
      }
      const updateEmployee = [
        {
          name: 'employeeToUpdate',
          type: 'list',
          message: 'Which employee has changed roles?',
          choices: employeesArray,
        },
        {
          name: 'newRole',
          type: 'list',
          message: 'Which is the new role of the employee?',
          choices: rolesArray,
        },
      ];
      inquirer.prompt(updateEmployee).then((response) => {
        let employeeIdString = response.employeeToUpdate;
        let employeeIdArray = employeeIdString.split(' ');
        let roleIdString = response.newRole;
        let roleIdArray = roleIdString.split(' ');
        db.query(
          `UPDATE employee SET role_id = "${roleIdArray[0]}" WHERE id = ${employeeIdArray[0]}`
        );
        db.query(
          "SELECT employee.id, CONCAT(first_name, ' ', last_name) AS employee_name, title, name AS department_name, salary, manager_id FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id",
          (employeeErr, employeeResults) => {
            if (employeeErr) {
              console.log('Error with Employee Query');
            }
            console.table(employeeResults);
            console.log(
              `The employee has been successfully updated to a new role!`
            );
            init();
          }
        );
      });
    });
  });
}

function deleteDepartment() {
  db.query('SELECT * FROM department', (departmentError, departmentResults) => {
    if (departmentError) {
      console.log('Error with Department Query');
    }
    let departments = departmentResults.map(({ id, name }) => ({
      value: id,
      name: `${id} ${name}`,
    }));
    let departmentsArray = [];
    for (let i = 0; i < departments.length; i++) {
      departmentsArray.push(departments[i].name);
    }
    const removeDepartment = [
      {
        name: 'deleteDepartment',
        type: 'list',
        message: 'Which department would you like to delete?',
        choices: departmentsArray,
      },
    ];
    inquirer.prompt(removeDepartment).then((response) => {
      let departmentIdString = response.deleteDepartment;
      let departmentIdArray = departmentIdString.split(' ');
      db.query(`DELETE FROM department WHERE id = ${departmentIdArray[0]};`);
      db.query(
        'SELECT name, id FROM department',
        (departmentError, departmentResults) => {
          if (departmentError) {
            console.log('Error with Deparment Query');
          }
          console.table(departmentResults);
          console.log(
            `${response.deleteDepartment} department successfully deleted!`
          );
          init();
        }
      );
    });
  });
}

function deleteRole() {
  db.query('SELECT * FROM role', (roleError, roleResults) => {
    if (roleError) {
      console.log('Error with Role Query');
    }
    let roles = roleResults.map(({ id, title }) => ({
      value: id,
      name: `${id} ${title}`,
    }));
    let rolesArray = [];
    for (let i = 0; i < roles.length; i++) {
      rolesArray.push(roles[i].name);
    }
    const removeRole = [
      {
        name: 'deleteRole',
        type: 'list',
        message: 'Which role would you like to delete?',
        choices: rolesArray,
      },
    ];
    inquirer.prompt(removeRole).then((response) => {
      let roleIdString = response.deleteRole;
      let roleIdArray = roleIdString.split(' ');
      db.query(`DELETE FROM role WHERE id = ${roleIdArray[0]};`);
      db.query(
        'SELECT title, role.id, name AS department_name, salary FROM role JOIN department ON role.department_id = department.id',
        (roleErr, roleResults) => {
          if (roleErr) {
            console.log('Error with Role Query');
          }
          console.table(roleResults);
          console.log(`${response.deleteRole} role successfully deleted!`);
          init();
        }
      );
    });
  });
}

function deleteEmployee() {
  db.query('SELECT * FROM employee', (employeeErr, employeeResults) => {
    if (employeeErr) {
      console.log('Error with Employee Query');
    }
    let employees = employeeResults.map(({ id, first_name, last_name }) => ({
      value: id,
      name: `${id} ${first_name} ${last_name}`,
    }));
    let employeesArray = [];
    for (let i = 0; i < employees.length; i++) {
      employeesArray.push(employees[i].name);
    }
    const removeEmployee = [
      {
        name: 'deleteEmployee',
        type: 'list',
        message: 'Which employee would you like to delete?',
        choices: employeesArray,
      },
    ];
    inquirer.prompt(removeEmployee).then((response) => {
      let employeeIdString = response.deleteEmployee;
      let employeeIdArray = employeeIdString.split(' ');
      db.query(`DELETE FROM employee WHERE id = ${employeeIdArray[0]};`);
      db.query(
        "SELECT employee.id, CONCAT(first_name, ' ', last_name) AS employee_name, title, name AS department_name, salary, manager_id FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id",
        (employeeErr, employeeResults) => {
          if (employeeErr) {
            console.log('Error with Employee Query');
          }
          console.table(employeeResults);
          console.log(
            `${response.deleteEmployee} employee successfully deleted!`
          );
          init();
        }
      );
    });
  });
}