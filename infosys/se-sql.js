/* Generated: SQL lab data for /infosys. Expected outputs were produced by running each
   reference solution against SCHEMA in SQLite. Regenerate rather than hand-editing expected rows. */
window.SE_SQL = {
 "schema": "CREATE TABLE departments (dept_id INTEGER PRIMARY KEY, dept_name TEXT NOT NULL, location TEXT);\nINSERT INTO departments VALUES\n (1,'Engineering','Bengaluru'),(2,'Finance','Pune'),(3,'HR','Mysuru'),(4,'Marketing','Chennai'),(5,'Research','Hyderabad');\nCREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, dept_id INTEGER REFERENCES departments(dept_id),\n salary INTEGER, hire_date TEXT, manager_id INTEGER REFERENCES employees(emp_id));\nINSERT INTO employees VALUES\n (101,'Asha',1,85000,'2019-04-12',NULL),\n (102,'Ravi',1,72000,'2020-07-01',101),\n (103,'Meena',1,72000,'2021-01-15',101),\n (104,'Kiran',1,64000,'2022-03-10',102),\n (105,'Divya',1,58000,'2023-06-19',102),\n (106,'Arjun',1,91000,'2018-09-03',NULL),\n (107,'Sneha',2,67000,'2020-11-23',NULL),\n (108,'Vikram',2,54000,'2022-08-08',107),\n (109,'Pooja',2,54000,'2023-02-14',107),\n (110,'Rahul',3,48000,'2021-05-30',NULL),\n (111,'Nisha',3,51000,'2024-01-08',110),\n (112,'Sanjay',4,62000,'2019-12-02',NULL),\n (113,'Lakshmi',4,45000,'2024-07-22',112),\n (114,'Farhan',NULL,50000,'2024-09-16',NULL);\nCREATE TABLE employee_contacts (id INTEGER PRIMARY KEY, name TEXT, email TEXT);\nINSERT INTO employee_contacts VALUES\n (1,'Asha','asha@corp.in'),(2,'Ravi','ravi@corp.in'),(3,'Asha','asha@corp.in'),\n (4,'Meena','meena@corp.in'),(5,'Ravi','ravi@corp.in'),(6,'Asha','asha@corp.in');\nCREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT);\nINSERT INTO customers VALUES (1,'Anil','Bengaluru'),(2,'Bhavna','Pune'),(3,'Chetan','Chennai'),(4,'Deepa','Mysuru'),(5,'Esha','Hyderabad');\nCREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), amount INTEGER, order_date TEXT);\nINSERT INTO orders VALUES (1001,1,2500,'2025-01-05'),(1002,1,1200,'2025-02-11'),(1003,2,3400,'2025-02-20'),(1004,4,800,'2025-03-02'),(1005,2,1500,'2025-03-15');",
 "tables": {
  "departments": {
   "cols": [
    "dept_id",
    "dept_name",
    "location"
   ],
   "rows": [
    [
     1,
     "Engineering",
     "Bengaluru"
    ],
    [
     2,
     "Finance",
     "Pune"
    ],
    [
     3,
     "HR",
     "Mysuru"
    ],
    [
     4,
     "Marketing",
     "Chennai"
    ],
    [
     5,
     "Research",
     "Hyderabad"
    ]
   ]
  },
  "employees": {
   "cols": [
    "emp_id",
    "name",
    "dept_id",
    "salary",
    "hire_date",
    "manager_id"
   ],
   "rows": [
    [
     101,
     "Asha",
     1,
     85000,
     "2019-04-12",
     null
    ],
    [
     102,
     "Ravi",
     1,
     72000,
     "2020-07-01",
     101
    ],
    [
     103,
     "Meena",
     1,
     72000,
     "2021-01-15",
     101
    ],
    [
     104,
     "Kiran",
     1,
     64000,
     "2022-03-10",
     102
    ],
    [
     105,
     "Divya",
     1,
     58000,
     "2023-06-19",
     102
    ],
    [
     106,
     "Arjun",
     1,
     91000,
     "2018-09-03",
     null
    ],
    [
     107,
     "Sneha",
     2,
     67000,
     "2020-11-23",
     null
    ],
    [
     108,
     "Vikram",
     2,
     54000,
     "2022-08-08",
     107
    ],
    [
     109,
     "Pooja",
     2,
     54000,
     "2023-02-14",
     107
    ],
    [
     110,
     "Rahul",
     3,
     48000,
     "2021-05-30",
     null
    ],
    [
     111,
     "Nisha",
     3,
     51000,
     "2024-01-08",
     110
    ],
    [
     112,
     "Sanjay",
     4,
     62000,
     "2019-12-02",
     null
    ],
    [
     113,
     "Lakshmi",
     4,
     45000,
     "2024-07-22",
     112
    ],
    [
     114,
     "Farhan",
     null,
     50000,
     "2024-09-16",
     null
    ]
   ]
  },
  "employee_contacts": {
   "cols": [
    "id",
    "name",
    "email"
   ],
   "rows": [
    [
     1,
     "Asha",
     "asha@corp.in"
    ],
    [
     2,
     "Ravi",
     "ravi@corp.in"
    ],
    [
     3,
     "Asha",
     "asha@corp.in"
    ],
    [
     4,
     "Meena",
     "meena@corp.in"
    ],
    [
     5,
     "Ravi",
     "ravi@corp.in"
    ],
    [
     6,
     "Asha",
     "asha@corp.in"
    ]
   ]
  },
  "customers": {
   "cols": [
    "customer_id",
    "name",
    "city"
   ],
   "rows": [
    [
     1,
     "Anil",
     "Bengaluru"
    ],
    [
     2,
     "Bhavna",
     "Pune"
    ],
    [
     3,
     "Chetan",
     "Chennai"
    ],
    [
     4,
     "Deepa",
     "Mysuru"
    ],
    [
     5,
     "Esha",
     "Hyderabad"
    ]
   ]
  },
  "orders": {
   "cols": [
    "order_id",
    "customer_id",
    "amount",
    "order_date"
   ],
   "rows": [
    [
     1001,
     1,
     2500,
     "2025-01-05"
    ],
    [
     1002,
     1,
     1200,
     "2025-02-11"
    ],
    [
     1003,
     2,
     3400,
     "2025-02-20"
    ],
    [
     1004,
     4,
     800,
     "2025-03-02"
    ],
    [
     1005,
     2,
     1500,
     "2025-03-15"
    ]
   ]
  }
 },
 "exercises": [
  {
   "id": "all-employees",
   "title": "Retrieve all employee records",
   "topic": "SELECT basics",
   "tables": [
    "employees"
   ],
   "task": "Return every column of every employee, ordered by emp_id.",
   "solution": "SELECT *\nFROM employees\nORDER BY emp_id;",
   "verify": null,
   "ordered": true,
   "notes": "SELECT * is fine for exploring; in assessments and real code, name the columns you need.",
   "expected": {
    "cols": [
     "emp_id",
     "name",
     "dept_id",
     "salary",
     "hire_date",
     "manager_id"
    ],
    "rows": [
     [
      101,
      "Asha",
      1,
      85000,
      "2019-04-12",
      null
     ],
     [
      102,
      "Ravi",
      1,
      72000,
      "2020-07-01",
      101
     ],
     [
      103,
      "Meena",
      1,
      72000,
      "2021-01-15",
      101
     ],
     [
      104,
      "Kiran",
      1,
      64000,
      "2022-03-10",
      102
     ],
     [
      105,
      "Divya",
      1,
      58000,
      "2023-06-19",
      102
     ],
     [
      106,
      "Arjun",
      1,
      91000,
      "2018-09-03",
      null
     ],
     [
      107,
      "Sneha",
      2,
      67000,
      "2020-11-23",
      null
     ],
     [
      108,
      "Vikram",
      2,
      54000,
      "2022-08-08",
      107
     ],
     [
      109,
      "Pooja",
      2,
      54000,
      "2023-02-14",
      107
     ],
     [
      110,
      "Rahul",
      3,
      48000,
      "2021-05-30",
      null
     ],
     [
      111,
      "Nisha",
      3,
      51000,
      "2024-01-08",
      110
     ],
     [
      112,
      "Sanjay",
      4,
      62000,
      "2019-12-02",
      null
     ],
     [
      113,
      "Lakshmi",
      4,
      45000,
      "2024-07-22",
      112
     ],
     [
      114,
      "Farhan",
      null,
      50000,
      "2024-09-16",
      null
     ]
    ]
   }
  },
  {
   "id": "filter-salary",
   "title": "Filter employees by salary",
   "topic": "Filtering",
   "tables": [
    "employees"
   ],
   "task": "Return name and salary of employees earning between 50000 and 70000 inclusive, highest salary first, then by name.",
   "solution": "SELECT name, salary\nFROM employees\nWHERE salary BETWEEN 50000 AND 70000\nORDER BY salary DESC, name;",
   "verify": null,
   "ordered": true,
   "notes": "BETWEEN includes both ends. Equivalent: salary >= 50000 AND salary <= 70000.",
   "expected": {
    "cols": [
     "name",
     "salary"
    ],
    "rows": [
     [
      "Sneha",
      67000
     ],
     [
      "Kiran",
      64000
     ],
     [
      "Sanjay",
      62000
     ],
     [
      "Divya",
      58000
     ],
     [
      "Pooja",
      54000
     ],
     [
      "Vikram",
      54000
     ],
     [
      "Nisha",
      51000
     ],
     [
      "Farhan",
      50000
     ]
    ]
   }
  },
  {
   "id": "second-highest",
   "title": "Second-highest salary",
   "topic": "Subqueries",
   "tables": [
    "employees"
   ],
   "task": "Return the second-highest distinct salary as second_highest.",
   "solution": "SELECT MAX(salary) AS second_highest\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);",
   "verify": null,
   "ordered": false,
   "notes": "Alternatives: SELECT DISTINCT salary ... ORDER BY salary DESC LIMIT 1 OFFSET 1 (MySQL/PostgreSQL/SQLite); OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY (SQL Server 2012+/Oracle 12c+). Interviewers often ask what happens with ties: MAX(...) < MAX handles them, a plain LIMIT without DISTINCT does not.",
   "expected": {
    "cols": [
     "second_highest"
    ],
    "rows": [
     [
      85000
     ]
    ]
   }
  },
  {
   "id": "third-highest",
   "title": "Third-highest salary",
   "topic": "Window functions",
   "tables": [
    "employees"
   ],
   "task": "Return the third-highest distinct salary as third_highest.",
   "solution": "SELECT DISTINCT salary AS third_highest\nFROM employees\nORDER BY salary DESC\nLIMIT 1 OFFSET 2;",
   "verify": null,
   "ordered": false,
   "notes": "DISTINCT matters: 72000 appears twice. Without DISTINCT, OFFSET 2 would return 72000 by luck here but fails on other data.",
   "expected": {
    "cols": [
     "third_highest"
    ],
    "rows": [
     [
      72000
     ]
    ]
   }
  },
  {
   "id": "nth-highest",
   "title": "Nth-highest salary (N = 4)",
   "topic": "Window functions",
   "tables": [
    "employees"
   ],
   "task": "Using DENSE_RANK(), return the 4th-highest distinct salary and every employee earning it (name, salary).",
   "solution": "SELECT name, salary\nFROM (\n  SELECT name, salary,\n         DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n  FROM employees\n) t\nWHERE rnk = 4;",
   "verify": null,
   "ordered": false,
   "notes": "DENSE_RANK gives ties the same rank with no gaps; RANK would leave a gap after the tie at 72000. Correlated version: WHERE 3 = (SELECT COUNT(DISTINCT salary) FROM employees e2 WHERE e2.salary > e1.salary).",
   "expected": {
    "cols": [
     "name",
     "salary"
    ],
    "rows": [
     [
      "Sneha",
      67000
     ]
    ]
   }
  },
  {
   "id": "find-duplicates",
   "title": "Find duplicate records",
   "topic": "GROUP BY / HAVING",
   "tables": [
    "employee_contacts"
   ],
   "task": "List each (name, email) pair that appears more than once, with its count as copies.",
   "solution": "SELECT name, email, COUNT(*) AS copies\nFROM employee_contacts\nGROUP BY name, email\nHAVING COUNT(*) > 1;",
   "verify": null,
   "ordered": false,
   "notes": "HAVING filters groups after aggregation; WHERE cannot reference COUNT(*).",
   "expected": {
    "cols": [
     "name",
     "email",
     "copies"
    ],
    "rows": [
     [
      "Asha",
      "asha@corp.in",
      3
     ],
     [
      "Ravi",
      "ravi@corp.in",
      2
     ]
    ]
   }
  },
  {
   "id": "remove-duplicates",
   "title": "Remove duplicate records safely",
   "topic": "DML",
   "tables": [
    "employee_contacts"
   ],
   "task": "Delete duplicate rows from employee_contacts, keeping the row with the lowest id for each (name, email). The checker then runs SELECT * FROM employee_contacts ORDER BY id.",
   "solution": "DELETE FROM employee_contacts\nWHERE id NOT IN (\n  SELECT MIN(id)\n  FROM employee_contacts\n  GROUP BY name, email\n);",
   "verify": "SELECT * FROM employee_contacts ORDER BY id;",
   "ordered": true,
   "notes": "Run the inner SELECT on its own first and do it inside a transaction (BEGIN ... ROLLBACK/COMMIT). MySQL refuses to delete from a table it selects from in the same statement: wrap the subquery in another derived table, or use DELETE e1 FROM t e1 JOIN t e2 ON ... AND e1.id > e2.id. SQL Server/PostgreSQL often use ROW_NUMBER() in a CTE.",
   "expected": {
    "cols": [
     "id",
     "name",
     "email"
    ],
    "rows": [
     [
      1,
      "Asha",
      "asha@corp.in"
     ],
     [
      2,
      "Ravi",
      "ravi@corp.in"
     ],
     [
      4,
      "Meena",
      "meena@corp.in"
     ]
    ]
   }
  },
  {
   "id": "count-by-dept",
   "title": "Count employees by department",
   "topic": "Joins + aggregates",
   "tables": [
    "departments",
    "employees"
   ],
   "task": "For every department (including ones with nobody), show dept_name and the number of employees as emp_count, ordered by emp_count descending, then dept_name.",
   "solution": "SELECT d.dept_name, COUNT(e.emp_id) AS emp_count\nFROM departments d\nLEFT JOIN employees e ON e.dept_id = d.dept_id\nGROUP BY d.dept_id, d.dept_name\nORDER BY emp_count DESC, d.dept_name;",
   "verify": null,
   "ordered": true,
   "notes": "COUNT(e.emp_id) ignores NULLs, so Research shows 0. COUNT(*) would wrongly show 1 for it.",
   "expected": {
    "cols": [
     "dept_name",
     "emp_count"
    ],
    "rows": [
     [
      "Engineering",
      6
     ],
     [
      "Finance",
      3
     ],
     [
      "HR",
      2
     ],
     [
      "Marketing",
      2
     ],
     [
      "Research",
      0
     ]
    ]
   }
  },
  {
   "id": "dept-more-than-five",
   "title": "Departments with more than five employees",
   "topic": "GROUP BY / HAVING",
   "tables": [
    "departments",
    "employees"
   ],
   "task": "Return dept_name and emp_count for departments with more than five employees.",
   "solution": "SELECT d.dept_name, COUNT(*) AS emp_count\nFROM employees e\nJOIN departments d ON d.dept_id = e.dept_id\nGROUP BY d.dept_name\nHAVING COUNT(*) > 5;",
   "verify": null,
   "ordered": false,
   "notes": "",
   "expected": {
    "cols": [
     "dept_name",
     "emp_count"
    ],
    "rows": [
     [
      "Engineering",
      6
     ]
    ]
   }
  },
  {
   "id": "above-average",
   "title": "Employees earning above the average salary",
   "topic": "Subqueries",
   "tables": [
    "employees"
   ],
   "task": "Return name and salary of employees whose salary is greater than the company average, highest first, then by name.",
   "solution": "SELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees)\nORDER BY salary DESC, name;",
   "verify": null,
   "ordered": true,
   "notes": "Follow-up often asked: above their own department's average, which needs a correlated subquery (WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e1.dept_id)).",
   "expected": {
    "cols": [
     "name",
     "salary"
    ],
    "rows": [
     [
      "Arjun",
      91000
     ],
     [
      "Asha",
      85000
     ],
     [
      "Meena",
      72000
     ],
     [
      "Ravi",
      72000
     ],
     [
      "Sneha",
      67000
     ],
     [
      "Kiran",
      64000
     ]
    ]
   }
  },
  {
   "id": "no-department",
   "title": "Employees without a department",
   "topic": "NULL handling",
   "tables": [
    "employees"
   ],
   "task": "Return emp_id and name of employees who are not assigned to any department.",
   "solution": "SELECT emp_id, name\nFROM employees\nWHERE dept_id IS NULL;",
   "verify": null,
   "ordered": false,
   "notes": "dept_id = NULL is never true. NULL comparisons need IS NULL / IS NOT NULL.",
   "expected": {
    "cols": [
     "emp_id",
     "name"
    ],
    "rows": [
     [
      114,
      "Farhan"
     ]
    ]
   }
  },
  {
   "id": "max-per-dept",
   "title": "Highest-paid employee in each department",
   "topic": "Correlated subqueries",
   "tables": [
    "departments",
    "employees"
   ],
   "task": "Return dept_name, name and salary of the highest-paid employee(s) in each department, ordered by dept_name.",
   "solution": "SELECT d.dept_name, e.name, e.salary\nFROM employees e\nJOIN departments d ON d.dept_id = e.dept_id\nWHERE e.salary = (\n  SELECT MAX(e2.salary)\n  FROM employees e2\n  WHERE e2.dept_id = e.dept_id\n)\nORDER BY d.dept_name;",
   "verify": null,
   "ordered": true,
   "notes": "Window version: RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) = 1. If only the amount is needed, SELECT dept_id, MAX(salary) ... GROUP BY dept_id is enough.",
   "expected": {
    "cols": [
     "dept_name",
     "name",
     "salary"
    ],
    "rows": [
     [
      "Engineering",
      "Arjun",
      91000
     ],
     [
      "Finance",
      "Sneha",
      67000
     ],
     [
      "HR",
      "Nisha",
      51000
     ],
     [
      "Marketing",
      "Sanjay",
      62000
     ]
    ]
   }
  },
  {
   "id": "hired-after",
   "title": "Employees hired after a date",
   "topic": "Filtering",
   "tables": [
    "employees"
   ],
   "task": "Return name and hire_date of employees hired after 2023-01-01, oldest hire first.",
   "solution": "SELECT name, hire_date\nFROM employees\nWHERE hire_date > '2023-01-01'\nORDER BY hire_date;",
   "verify": null,
   "ordered": true,
   "notes": "Dates are stored as ISO text in this SQLite lab, so string comparison works. In MySQL/PostgreSQL use a DATE column and DATE '2023-01-01'; Oracle uses TO_DATE('2023-01-01','YYYY-MM-DD').",
   "expected": {
    "cols": [
     "name",
     "hire_date"
    ],
    "rows": [
     [
      "Pooja",
      "2023-02-14"
     ],
     [
      "Divya",
      "2023-06-19"
     ],
     [
      "Nisha",
      "2024-01-08"
     ],
     [
      "Lakshmi",
      "2024-07-22"
     ],
     [
      "Farhan",
      "2024-09-16"
     ]
    ]
   }
  },
  {
   "id": "join-emp-dept",
   "title": "Join Employee and Department tables",
   "topic": "Joins",
   "tables": [
    "departments",
    "employees"
   ],
   "task": "Return each employee's name with their dept_name and location. Only employees that have a department. Order by emp_id.",
   "solution": "SELECT e.name, d.dept_name, d.location\nFROM employees e\nINNER JOIN departments d ON d.dept_id = e.dept_id\nORDER BY e.emp_id;",
   "verify": null,
   "ordered": true,
   "notes": "Farhan disappears because INNER JOIN keeps only matches. Switch to LEFT JOIN and he appears with NULLs.",
   "expected": {
    "cols": [
     "name",
     "dept_name",
     "location"
    ],
    "rows": [
     [
      "Asha",
      "Engineering",
      "Bengaluru"
     ],
     [
      "Ravi",
      "Engineering",
      "Bengaluru"
     ],
     [
      "Meena",
      "Engineering",
      "Bengaluru"
     ],
     [
      "Kiran",
      "Engineering",
      "Bengaluru"
     ],
     [
      "Divya",
      "Engineering",
      "Bengaluru"
     ],
     [
      "Arjun",
      "Engineering",
      "Bengaluru"
     ],
     [
      "Sneha",
      "Finance",
      "Pune"
     ],
     [
      "Vikram",
      "Finance",
      "Pune"
     ],
     [
      "Pooja",
      "Finance",
      "Pune"
     ],
     [
      "Rahul",
      "HR",
      "Mysuru"
     ],
     [
      "Nisha",
      "HR",
      "Mysuru"
     ],
     [
      "Sanjay",
      "Marketing",
      "Chennai"
     ],
     [
      "Lakshmi",
      "Marketing",
      "Chennai"
     ]
    ]
   }
  },
  {
   "id": "dept-no-employees",
   "title": "Records in one table but not another",
   "topic": "EXISTS / anti-join",
   "tables": [
    "departments",
    "employees"
   ],
   "task": "Return dept_id and dept_name of departments that have no employees.",
   "solution": "SELECT d.dept_id, d.dept_name\nFROM departments d\nWHERE NOT EXISTS (\n  SELECT 1 FROM employees e WHERE e.dept_id = d.dept_id\n);",
   "verify": null,
   "ordered": false,
   "notes": "Equivalent: LEFT JOIN ... WHERE e.emp_id IS NULL, or EXCEPT/MINUS on ids. Beware NOT IN with a subquery that can return NULL: employees.dept_id contains a NULL, so WHERE dept_id NOT IN (SELECT dept_id FROM employees) returns no rows at all.",
   "expected": {
    "cols": [
     "dept_id",
     "dept_name"
    ],
    "rows": [
     [
      5,
      "Research"
     ]
    ]
   }
  },
  {
   "id": "conditional-update",
   "title": "Update salary based on a condition",
   "topic": "DML",
   "tables": [
    "employees"
   ],
   "task": "Give a 10% raise to HR employees (dept_id 3) earning below 50000. The checker then runs SELECT name, salary FROM employees WHERE dept_id = 3 ORDER BY emp_id.",
   "solution": "UPDATE employees\nSET salary = salary * 1.10\nWHERE dept_id = 3 AND salary < 50000;",
   "verify": "SELECT name, salary FROM employees WHERE dept_id = 3 ORDER BY emp_id;",
   "ordered": true,
   "notes": "Always run the matching SELECT with the same WHERE before an UPDATE. An UPDATE without WHERE changes every row.",
   "expected": {
    "cols": [
     "name",
     "salary"
    ],
    "rows": [
     [
      "Rahul",
      52800
     ],
     [
      "Nisha",
      51000
     ]
    ]
   }
  },
  {
   "id": "never-ordered",
   "title": "Customers who never placed an order",
   "topic": "Joins",
   "tables": [
    "customers",
    "orders"
   ],
   "task": "Return customer_id and name of customers with no orders.",
   "solution": "SELECT c.customer_id, c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL;",
   "verify": null,
   "ordered": false,
   "notes": "Classic anti-join. NOT EXISTS gives the same result and reads more clearly to some interviewers.",
   "expected": {
    "cols": [
     "customer_id",
     "name"
    ],
    "rows": [
     [
      3,
      "Chetan"
     ],
     [
      5,
      "Esha"
     ]
    ]
   }
  },
  {
   "id": "manager-names",
   "title": "Employee with manager name",
   "topic": "Self join",
   "tables": [
    "employees"
   ],
   "task": "Return employee name and their manager's name as manager (NULL when there is none), ordered by employee emp_id.",
   "solution": "SELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON m.emp_id = e.manager_id\nORDER BY e.emp_id;",
   "verify": null,
   "ordered": true,
   "notes": "A self join needs two aliases of the same table.",
   "expected": {
    "cols": [
     "employee",
     "manager"
    ],
    "rows": [
     [
      "Asha",
      null
     ],
     [
      "Ravi",
      "Asha"
     ],
     [
      "Meena",
      "Asha"
     ],
     [
      "Kiran",
      "Ravi"
     ],
     [
      "Divya",
      "Ravi"
     ],
     [
      "Arjun",
      null
     ],
     [
      "Sneha",
      null
     ],
     [
      "Vikram",
      "Sneha"
     ],
     [
      "Pooja",
      "Sneha"
     ],
     [
      "Rahul",
      null
     ],
     [
      "Nisha",
      "Rahul"
     ],
     [
      "Sanjay",
      null
     ],
     [
      "Lakshmi",
      "Sanjay"
     ],
     [
      "Farhan",
      null
     ]
    ]
   }
  },
  {
   "id": "customer-totals",
   "title": "Total order value per customer",
   "topic": "Joins + aggregates",
   "tables": [
    "customers",
    "orders"
   ],
   "task": "For customers who have ordered, return name, number of orders as order_count and total amount as total_amount, highest total first.",
   "solution": "SELECT c.name, COUNT(*) AS order_count, SUM(o.amount) AS total_amount\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name\nORDER BY total_amount DESC;",
   "verify": null,
   "ordered": true,
   "notes": "",
   "expected": {
    "cols": [
     "name",
     "order_count",
     "total_amount"
    ],
    "rows": [
     [
      "Bhavna",
      2,
      4900
     ],
     [
      "Anil",
      2,
      3700
     ],
     [
      "Deepa",
      1,
      800
     ]
    ]
   }
  },
  {
   "id": "salary-band",
   "title": "Classify salaries with CASE",
   "topic": "CASE",
   "tables": [
    "employees"
   ],
   "task": "Return name, salary and band, where band is 'High' for salary >= 70000, 'Mid' for 55000–69999 and 'Entry' otherwise. Order by salary descending, then name.",
   "solution": "SELECT name, salary,\n  CASE\n    WHEN salary >= 70000 THEN 'High'\n    WHEN salary >= 55000 THEN 'Mid'\n    ELSE 'Entry'\n  END AS band\nFROM employees\nORDER BY salary DESC, name;",
   "verify": null,
   "ordered": true,
   "notes": "CASE is evaluated top-down; the first matching WHEN wins.",
   "expected": {
    "cols": [
     "name",
     "salary",
     "band"
    ],
    "rows": [
     [
      "Arjun",
      91000,
      "High"
     ],
     [
      "Asha",
      85000,
      "High"
     ],
     [
      "Meena",
      72000,
      "High"
     ],
     [
      "Ravi",
      72000,
      "High"
     ],
     [
      "Sneha",
      67000,
      "Mid"
     ],
     [
      "Kiran",
      64000,
      "Mid"
     ],
     [
      "Sanjay",
      62000,
      "Mid"
     ],
     [
      "Divya",
      58000,
      "Mid"
     ],
     [
      "Pooja",
      54000,
      "Entry"
     ],
     [
      "Vikram",
      54000,
      "Entry"
     ],
     [
      "Nisha",
      51000,
      "Entry"
     ],
     [
      "Farhan",
      50000,
      "Entry"
     ],
     [
      "Rahul",
      48000,
      "Entry"
     ],
     [
      "Lakshmi",
      45000,
      "Entry"
     ]
    ]
   }
  },
  {
   "id": "create-view",
   "title": "Create and query a view",
   "topic": "Views",
   "tables": [
    "employees",
    "departments"
   ],
   "task": "Create a view named high_earners with emp_id, name, dept_name and salary for employees earning 70000 or more (department name via a join). The checker then runs SELECT * FROM high_earners ORDER BY emp_id.",
   "solution": "CREATE VIEW high_earners AS\nSELECT e.emp_id, e.name, d.dept_name, e.salary\nFROM employees e\nJOIN departments d ON d.dept_id = e.dept_id\nWHERE e.salary >= 70000;",
   "verify": "SELECT * FROM high_earners ORDER BY emp_id;",
   "ordered": true,
   "notes": "A view stores the query, not the rows. In Oracle you can use CREATE OR REPLACE VIEW; SQLite needs DROP VIEW first. Each Lab run starts from a fresh database, so the view never already exists.",
   "expected": {
    "cols": [
     "emp_id",
     "name",
     "dept_name",
     "salary"
    ],
    "rows": [
     [
      101,
      "Asha",
      "Engineering",
      85000
     ],
     [
      102,
      "Ravi",
      "Engineering",
      72000
     ],
     [
      103,
      "Meena",
      "Engineering",
      72000
     ],
     [
      106,
      "Arjun",
      "Engineering",
      91000
     ]
    ]
   }
  }
 ]
};
