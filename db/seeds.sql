INSERT INTO department (name)
VALUES  ("Sales"),
        ("Marketing"),
        ("Accounting");


INSERT INTO role (title, salary, department_id)
VALUES  ("Accounting Manager", 75000, 3),
        ("Accounts Payable", 45000, 3),
        ("Marketing Head", 80000, 2),
        ("Social media Manager", 30000, 2),
        ("Team Lead", 40000, 1),
        ("Floor Manager", 60000, 1);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES  ("John", "Doe", 1, null),
        ("Randall", "Jones", 3, null),
        ("Robyn", "Knight", 2, 1),
        ("Richard", "Richardson", 4, 2),
        ("Guy", "McDude", 6, null),
        ("Kelly", "Smellington", 5, 5)
