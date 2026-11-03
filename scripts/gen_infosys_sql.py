"""Generates infosys/se-sql.js: sample schema + SQL exercises whose expected
outputs are produced by actually running the reference solutions in SQLite."""
import sqlite3, json, sys

SCHEMA = """
CREATE TABLE departments (dept_id INTEGER PRIMARY KEY, dept_name TEXT NOT NULL, location TEXT);
INSERT INTO departments VALUES
 (1,'Engineering','Bengaluru'),(2,'Finance','Pune'),(3,'HR','Mysuru'),(4,'Marketing','Chennai'),(5,'Research','Hyderabad');
CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, dept_id INTEGER REFERENCES departments(dept_id),
 salary INTEGER, hire_date TEXT, manager_id INTEGER REFERENCES employees(emp_id));
INSERT INTO employees VALUES
 (101,'Asha',1,85000,'2019-04-12',NULL),
 (102,'Ravi',1,72000,'2020-07-01',101),
 (103,'Meena',1,72000,'2021-01-15',101),
 (104,'Kiran',1,64000,'2022-03-10',102),
 (105,'Divya',1,58000,'2023-06-19',102),
 (106,'Arjun',1,91000,'2018-09-03',NULL),
 (107,'Sneha',2,67000,'2020-11-23',NULL),
 (108,'Vikram',2,54000,'2022-08-08',107),
 (109,'Pooja',2,54000,'2023-02-14',107),
 (110,'Rahul',3,48000,'2021-05-30',NULL),
 (111,'Nisha',3,51000,'2024-01-08',110),
 (112,'Sanjay',4,62000,'2019-12-02',NULL),
 (113,'Lakshmi',4,45000,'2024-07-22',112),
 (114,'Farhan',NULL,50000,'2024-09-16',NULL);
CREATE TABLE employee_contacts (id INTEGER PRIMARY KEY, name TEXT, email TEXT);
INSERT INTO employee_contacts VALUES
 (1,'Asha','asha@corp.in'),(2,'Ravi','ravi@corp.in'),(3,'Asha','asha@corp.in'),
 (4,'Meena','meena@corp.in'),(5,'Ravi','ravi@corp.in'),(6,'Asha','asha@corp.in');
CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT);
INSERT INTO customers VALUES (1,'Anil','Bengaluru'),(2,'Bhavna','Pune'),(3,'Chetan','Chennai'),(4,'Deepa','Mysuru'),(5,'Esha','Hyderabad');
CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), amount INTEGER, order_date TEXT);
INSERT INTO orders VALUES (1001,1,2500,'2025-01-05'),(1002,1,1200,'2025-02-11'),(1003,2,3400,'2025-02-20'),(1004,4,800,'2025-03-02'),(1005,2,1500,'2025-03-15');
"""

# (id, title, topic, tables, task, solution, verify-query-or-None, ordered, notes)
EX = [
 ("all-employees", "Retrieve all employee records", "SELECT basics", ["employees"],
  "Return every column of every employee, ordered by emp_id.",
  "SELECT *\nFROM employees\nORDER BY emp_id;",
  None, True,
  "SELECT * is fine for exploring; in assessments and real code, name the columns you need."),
 ("filter-salary", "Filter employees by salary", "Filtering", ["employees"],
  "Return name and salary of employees earning between 50000 and 70000 inclusive, highest salary first, then by name.",
  "SELECT name, salary\nFROM employees\nWHERE salary BETWEEN 50000 AND 70000\nORDER BY salary DESC, name;",
  None, True,
  "BETWEEN includes both ends. Equivalent: salary >= 50000 AND salary <= 70000."),
 ("second-highest", "Second-highest salary", "Subqueries", ["employees"],
  "Return the second-highest distinct salary as second_highest.",
  "SELECT MAX(salary) AS second_highest\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);",
  None, False,
  "Alternatives: SELECT DISTINCT salary ... ORDER BY salary DESC LIMIT 1 OFFSET 1 (MySQL/PostgreSQL/SQLite); OFFSET 1 ROWS FETCH NEXT 1 ROWS ONLY (SQL Server 2012+/Oracle 12c+). Interviewers often ask what happens with ties: MAX(...) < MAX handles them, a plain LIMIT without DISTINCT does not."),
 ("third-highest", "Third-highest salary", "Window functions", ["employees"],
  "Return the third-highest distinct salary as third_highest.",
  "SELECT DISTINCT salary AS third_highest\nFROM employees\nORDER BY salary DESC\nLIMIT 1 OFFSET 2;",
  None, False,
  "DISTINCT matters: 72000 appears twice. Without DISTINCT, OFFSET 2 would return 72000 by luck here but fails on other data."),
 ("nth-highest", "Nth-highest salary (N = 4)", "Window functions", ["employees"],
  "Using DENSE_RANK(), return the 4th-highest distinct salary and every employee earning it (name, salary).",
  "SELECT name, salary\nFROM (\n  SELECT name, salary,\n         DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n  FROM employees\n) t\nWHERE rnk = 4;",
  None, False,
  "DENSE_RANK gives ties the same rank with no gaps; RANK would leave a gap after the tie at 72000. Correlated version: WHERE 3 = (SELECT COUNT(DISTINCT salary) FROM employees e2 WHERE e2.salary > e1.salary)."),
 ("find-duplicates", "Find duplicate records", "GROUP BY / HAVING", ["employee_contacts"],
  "List each (name, email) pair that appears more than once, with its count as copies.",
  "SELECT name, email, COUNT(*) AS copies\nFROM employee_contacts\nGROUP BY name, email\nHAVING COUNT(*) > 1;",
  None, False,
  "HAVING filters groups after aggregation; WHERE cannot reference COUNT(*)."),
 ("remove-duplicates", "Remove duplicate records safely", "DML", ["employee_contacts"],
  "Delete duplicate rows from employee_contacts, keeping the row with the lowest id for each (name, email). The checker then runs SELECT * FROM employee_contacts ORDER BY id.",
  "DELETE FROM employee_contacts\nWHERE id NOT IN (\n  SELECT MIN(id)\n  FROM employee_contacts\n  GROUP BY name, email\n);",
  "SELECT * FROM employee_contacts ORDER BY id;", True,
  "Run the inner SELECT on its own first and do it inside a transaction (BEGIN ... ROLLBACK/COMMIT). MySQL refuses to delete from a table it selects from in the same statement: wrap the subquery in another derived table, or use DELETE e1 FROM t e1 JOIN t e2 ON ... AND e1.id > e2.id. SQL Server/PostgreSQL often use ROW_NUMBER() in a CTE."),
 ("count-by-dept", "Count employees by department", "Joins + aggregates", ["departments", "employees"],
  "For every department (including ones with nobody), show dept_name and the number of employees as emp_count, ordered by emp_count descending, then dept_name.",
  "SELECT d.dept_name, COUNT(e.emp_id) AS emp_count\nFROM departments d\nLEFT JOIN employees e ON e.dept_id = d.dept_id\nGROUP BY d.dept_id, d.dept_name\nORDER BY emp_count DESC, d.dept_name;",
  None, True,
  "COUNT(e.emp_id) ignores NULLs, so Research shows 0. COUNT(*) would wrongly show 1 for it."),
 ("dept-more-than-five", "Departments with more than five employees", "GROUP BY / HAVING", ["departments", "employees"],
  "Return dept_name and emp_count for departments with more than five employees.",
  "SELECT d.dept_name, COUNT(*) AS emp_count\nFROM employees e\nJOIN departments d ON d.dept_id = e.dept_id\nGROUP BY d.dept_name\nHAVING COUNT(*) > 5;",
  None, False, ""),
 ("above-average", "Employees earning above the average salary", "Subqueries", ["employees"],
  "Return name and salary of employees whose salary is greater than the company average, highest first, then by name.",
  "SELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees)\nORDER BY salary DESC, name;",
  None, True,
  "Follow-up often asked: above their own department's average, which needs a correlated subquery (WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e1.dept_id))."),
 ("no-department", "Employees without a department", "NULL handling", ["employees"],
  "Return emp_id and name of employees who are not assigned to any department.",
  "SELECT emp_id, name\nFROM employees\nWHERE dept_id IS NULL;",
  None, False,
  "dept_id = NULL is never true. NULL comparisons need IS NULL / IS NOT NULL."),
 ("max-per-dept", "Highest-paid employee in each department", "Correlated subqueries", ["departments", "employees"],
  "Return dept_name, name and salary of the highest-paid employee(s) in each department, ordered by dept_name.",
  "SELECT d.dept_name, e.name, e.salary\nFROM employees e\nJOIN departments d ON d.dept_id = e.dept_id\nWHERE e.salary = (\n  SELECT MAX(e2.salary)\n  FROM employees e2\n  WHERE e2.dept_id = e.dept_id\n)\nORDER BY d.dept_name;",
  None, True,
  "Window version: RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) = 1. If only the amount is needed, SELECT dept_id, MAX(salary) ... GROUP BY dept_id is enough."),
 ("hired-after", "Employees hired after a date", "Filtering", ["employees"],
  "Return name and hire_date of employees hired after 2023-01-01, oldest hire first.",
  "SELECT name, hire_date\nFROM employees\nWHERE hire_date > '2023-01-01'\nORDER BY hire_date;",
  None, True,
  "Dates are stored as ISO text in this SQLite lab, so string comparison works. In MySQL/PostgreSQL use a DATE column and DATE '2023-01-01'; Oracle uses TO_DATE('2023-01-01','YYYY-MM-DD')."),
 ("join-emp-dept", "Join Employee and Department tables", "Joins", ["departments", "employees"],
  "Return each employee's name with their dept_name and location. Only employees that have a department. Order by emp_id.",
  "SELECT e.name, d.dept_name, d.location\nFROM employees e\nINNER JOIN departments d ON d.dept_id = e.dept_id\nORDER BY e.emp_id;",
  None, True,
  "Farhan disappears because INNER JOIN keeps only matches. Switch to LEFT JOIN and he appears with NULLs."),
 ("dept-no-employees", "Records in one table but not another", "EXISTS / anti-join", ["departments", "employees"],
  "Return dept_id and dept_name of departments that have no employees.",
  "SELECT d.dept_id, d.dept_name\nFROM departments d\nWHERE NOT EXISTS (\n  SELECT 1 FROM employees e WHERE e.dept_id = d.dept_id\n);",
  None, False,
  "Equivalent: LEFT JOIN ... WHERE e.emp_id IS NULL, or EXCEPT/MINUS on ids. Beware NOT IN with a subquery that can return NULL: employees.dept_id contains a NULL, so WHERE dept_id NOT IN (SELECT dept_id FROM employees) returns no rows at all."),
 ("conditional-update", "Update salary based on a condition", "DML", ["employees"],
  "Give a 10% raise to HR employees (dept_id 3) earning below 50000. The checker then runs SELECT name, salary FROM employees WHERE dept_id = 3 ORDER BY emp_id.",
  "UPDATE employees\nSET salary = salary * 1.10\nWHERE dept_id = 3 AND salary < 50000;",
  "SELECT name, salary FROM employees WHERE dept_id = 3 ORDER BY emp_id;", True,
  "Always run the matching SELECT with the same WHERE before an UPDATE. An UPDATE without WHERE changes every row."),
 ("never-ordered", "Customers who never placed an order", "Joins", ["customers", "orders"],
  "Return customer_id and name of customers with no orders.",
  "SELECT c.customer_id, c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.customer_id\nWHERE o.order_id IS NULL;",
  None, False,
  "Classic anti-join. NOT EXISTS gives the same result and reads more clearly to some interviewers."),
 ("manager-names", "Employee with manager name", "Self join", ["employees"],
  "Return employee name and their manager's name as manager (NULL when there is none), ordered by employee emp_id.",
  "SELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON m.emp_id = e.manager_id\nORDER BY e.emp_id;",
  None, True,
  "A self join needs two aliases of the same table."),
 ("customer-totals", "Total order value per customer", "Joins + aggregates", ["customers", "orders"],
  "For customers who have ordered, return name, number of orders as order_count and total amount as total_amount, highest total first.",
  "SELECT c.name, COUNT(*) AS order_count, SUM(o.amount) AS total_amount\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name\nORDER BY total_amount DESC;",
  None, True, ""),
 ("salary-band", "Classify salaries with CASE", "CASE", ["employees"],
  "Return name, salary and band, where band is 'High' for salary >= 70000, 'Mid' for 55000–69999 and 'Entry' otherwise. Order by salary descending, then name.",
  "SELECT name, salary,\n  CASE\n    WHEN salary >= 70000 THEN 'High'\n    WHEN salary >= 55000 THEN 'Mid'\n    ELSE 'Entry'\n  END AS band\nFROM employees\nORDER BY salary DESC, name;",
  None, True, "CASE is evaluated top-down; the first matching WHEN wins."),
 ("create-view", "Create and query a view", "Views", ["employees", "departments"],
  "Create a view named high_earners with emp_id, name, dept_name and salary for employees earning 70000 or more (department name via a join). The checker then runs SELECT * FROM high_earners ORDER BY emp_id.",
  "CREATE VIEW high_earners AS\nSELECT e.emp_id, e.name, d.dept_name, e.salary\nFROM employees e\nJOIN departments d ON d.dept_id = e.dept_id\nWHERE e.salary >= 70000;",
  "SELECT * FROM high_earners ORDER BY emp_id;", True,
  "A view stores the query, not the rows. In Oracle you can use CREATE OR REPLACE VIEW; SQLite needs DROP VIEW first. Each Lab run starts from a fresh database, so the view never already exists."),
]

def run(sql, verify):
    con = sqlite3.connect(":memory:")
    con.executescript(SCHEMA)
    cur = con.cursor()
    cur.executescript(sql) if verify else None
    if verify:
        cur.execute(verify)
    else:
        cur.execute(sql)
    cols = [d[0] for d in cur.description]
    rows = [list(r) for r in cur.fetchall()]
    # normalise floats like 52800.000000001
    for r in rows:
        for i, v in enumerate(r):
            if isinstance(v, float) and abs(v - round(v)) < 1e-6:
                r[i] = int(round(v))
    return cols, rows

out = []
for (i, title, topic, tables, task, sol, verify, ordered, notes) in EX:
    cols, rows = run(sol, verify)
    out.append(dict(id=i, title=title, topic=topic, tables=tables, task=task, solution=sol,
                    verify=verify, ordered=ordered, notes=notes, expected=dict(cols=cols, rows=rows)))
    print(f"{i}: {cols} {rows}", file=sys.stderr)

# sample tables for display
con = sqlite3.connect(":memory:"); con.executescript(SCHEMA)
tables = {}
for t in ["departments", "employees", "employee_contacts", "customers", "orders"]:
    cur = con.execute(f"SELECT * FROM {t}")
    tables[t] = dict(cols=[d[0] for d in cur.description], rows=[list(r) for r in cur.fetchall()])

js = ("/* Generated: SQL lab data for /infosys. Expected outputs were produced by running each\n"
      "   reference solution against SCHEMA in SQLite. Regenerate rather than hand-editing expected rows. */\n"
      "window.SE_SQL = " + json.dumps(dict(schema=SCHEMA.strip(), tables=tables, exercises=out), indent=1, ensure_ascii=False) + ";\n")
open(sys.argv[1], "w", encoding="utf-8").write(js)
print("wrote", sys.argv[1], file=sys.stderr)
