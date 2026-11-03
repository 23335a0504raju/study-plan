/* =====================================================================
   Infosys Internal Training (Systems Engineer, already selected) — content.
   Three phases: A pre-joining preparation, B Generic Foundation Training
   (after joining), C technology stream training (user-built, see app).

   Item ids are module key + section key + slug(item text). Module/section
   keys and item wording from schema v1 were kept where the topic is the
   same, so old progress carries over; ALIASES maps the remaining renamed
   v1 ids. Adding or reordering items is safe.

   Item classification "s":
     off  = officially published by Infosys
     rep  = reported in trainee experiences (not official)
     fund = common technical fundamentals
     add  = additional / batch-dependent preparation
   Priority "p": vhigh | high | medium | additional (study planning only).
   An item is a string, or { t, d, s } with a hint and/or class override.
   ===================================================================== */
window.SE_CONTENT = (function () {
  const I = (t, d, s) => ({ t, d, s });

  const PHASES = [
    { key: "A", name: "Pre-joining preparation", short: "Pre-joining", when: "Before joining", badge: "Prepare now",
      blurb: "Java coding, OOP, core Java, DBMS, SQL and technical MCQs: the subjects trainees report as central to the generic Java and DBMS assessments. Get these solid before day one." },
    { key: "B", name: "Generic Foundation Training", short: "Generic Foundation", when: "After joining",
      blurb: "Follows your actual class schedule. Java (FA1-style) and DBMS/SQL (FA2-style) assessment preparation, plus OS/IT fundamentals, software engineering, HTML/CSS and professional skills. Your batch's official training material always takes priority over this checklist." },
    { key: "C", name: "Technology stream training", short: "Stream", when: "After stream allocation",
      blurb: "Your assigned stream's syllabus, assessments and capstone project. Nothing is preloaded; you build it from the material Infosys gives your batch." }
  ];

  const MODULES = [
    /* ============================ PHASE A ============================ */
    { key: "coding", phase: "A", code: "A1", name: "Basic Coding with Java", title: "Basic Coding with Java", p: "vhigh", short: "Java coding",
      blurb: "Practical programming at the level needed to follow internal Java training and solve hands-on Java questions. Write every program yourself, without an IDE's auto-complete at least once, and log it in Java practice.",
      sections: [
        { key: "javafund", n: "Java fundamentals", s: "fund", items: [
          "Java syntax", "Variables and data types", "Operators", "Type conversion", "Conditional statements", "If-else", "Switch",
          "For loops", "While loops", "Nested loops", "Methods", I("Basic input and output", "Scanner for input; System.out.println / printf for output."),
          "Number-based programs"
        ]},
        { key: "number", n: "Basic number programs", s: "fund", items: [
          I("Prime number", "Loop to √n and handle n < 2."), "Factorial", I("Fibonacci series", "Iterative first, then recursive."),
          I("Palindrome number", "Reverse with % 10 and / 10, then compare."), "Armstrong number", "Reverse a number", "Sum of digits", "Count digits", "GCD and LCM"
        ]},
        { key: "array", n: "Arrays", s: "fund", items: [
          "Array declaration and initialization", "Array traversal", "Maximum and minimum element",
          I("Second-largest element", "Single pass with two variables; decide what happens with duplicates."), "Reverse an array", "Sort an array",
          "Search an element", "Find duplicate elements", I("Find missing element", "1..n with one missing: n(n+1)/2 − sum."), "Count element frequency",
          "Array rotation", "Merge two arrays", "Separate even and odd elements", "Basic two-dimensional arrays", I("Basic matrix operations", "Addition, transpose, diagonal sum.")
        ]},
        { key: "string", n: "Strings", s: "fund", items: [
          "String creation and comparison", I("String methods", "length, charAt, substring, indexOf, contains, split, trim, toUpperCase, replace, toCharArray."),
          "String immutability", "Reverse a string", "String palindrome", "Count vowels and consonants", "Character frequency",
          "Find duplicate characters", "First non-repeating character", I("Check anagrams", "Sort both char arrays, or count with int[26]."),
          "Reverse words in a sentence", "String manipulation using StringBuilder", "Basic substring problems"
        ]},
        { key: "dsa", n: "Slight DSA", s: "fund", items: [
          "ArrayList", I("Stack", "LIFO: push / pop / peek."), I("Queue", "FIFO: offer / poll / peek."), I("Basic searching", "Linear search, then binary search on sorted data."),
          I("Basic sorting", "Bubble, selection, insertion; Arrays.sort()."), "Basic recursion", I("Frequency-based problems", "HashMap getOrDefault, or int[] counts."),
          "Simple array problems", "Simple string problems", I("Basic time complexity", "O(1), O(n), O(n²), O(log n); count the loops.")
        ]}
      ]},

    { key: "oop", phase: "A", code: "A2", name: "OOP with Java", title: "Object-Oriented Programming with Java", p: "vhigh", short: "OOP",
      blurb: "One checkbox per concept. For each one, be able to give a definition, a real-world example and a short Java snippet, and to predict the output of a small inheritance program.",
      sections: [
        { key: "fund", n: "Classes, constructors and keywords", s: "fund", items: [
          "Class and object", "Constructors", "Default constructor", "Parameterized constructor", "this keyword", "super keyword",
          I("Constructor chaining", "this(...) within a class, super(...) to the parent; it must be the first statement."),
          I("Access modifiers", "private < default (package) < protected < public."), "Static keyword", "Final keyword"
        ]},
        { key: "pillars", n: "Four pillars", s: "fund", items: ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"] },
        { key: "poly", n: "Polymorphism in detail", s: "fund", items: [
          "Method overloading", "Method overriding", "Compile-time polymorphism", "Runtime polymorphism", "Dynamic method dispatch"
        ]},
        { key: "abs", n: "Abstract classes and interfaces", s: "fund", items: [
          "Abstract classes", I("Interfaces", "Default and static methods (Java 8); a class can implement many.")
        ]},
        { key: "other", n: "Relationships and casting", s: "fund", items: [
          "IS-A relationship", "HAS-A relationship", "Association", "Aggregation", "Composition", "Upcasting",
          I("Downcasting", "Compiles with a cast; ClassCastException at runtime if the object isn't that type. Check with instanceof.")
        ]},
        { key: "practical", n: "Practical OOP exercises", s: "fund", items: [
          "Create a Student class", "Create an Employee class", "Create a BankAccount class", "Implement inheritance",
          "Implement method overloading", "Implement method overriding", "Demonstrate encapsulation", "Create an abstract class",
          "Implement an interface", "Predict the output of inheritance programs", "Predict constructor execution order", "Practice OOP-based coding questions"
        ]}
      ]},

    { key: "java", phase: "A", code: "A3", name: "Core & Advanced Java", title: "Advanced Java / Core Java", p: "vhigh", short: "Core Java",
      blurb: "Language-level Java for objective questions and hands-on work. Spring Boot, JSP and other frameworks are not generic-training topics here; add them under My stream only if your stream syllabus includes them.",
      sections: [
        { key: "arch", n: "Java architecture and memory", s: "fund", items: [
          "JDK", "JRE", "JVM", I("Compilation process", "javac → .class bytecode → JVM (class loader, verifier, interpreter + JIT)."), "Bytecode",
          "Class loading fundamentals", "Java memory fundamentals", "Stack and heap basics", "Garbage collection fundamentals"
        ]},
        { key: "strings", n: "Strings and wrappers", s: "fund", items: [
          "String pool", "String immutability", "String versus StringBuilder", "String versus StringBuffer", "== versus equals()",
          "Wrapper classes", "Autoboxing", "Unboxing"
        ]},
        { key: "exceptions", n: "Exception handling", s: "fund", items: [
          "Exception hierarchy", "Checked exceptions", "Unchecked exceptions", "try and catch", "Multiple catch blocks", "finally",
          "throw", "throws", "Custom exceptions"
        ]},
        { key: "collections", n: "Collections", s: "fund", items: [
          I("Collection Framework", "Collection → List / Set / Queue; Map is separate."), "List", "ArrayList", "LinkedList", "Set", "HashSet", "Map", "HashMap",
          "Iterator", "Comparable", "Comparator", "Collection versus Collections", "ArrayList versus LinkedList", "HashMap versus HashSet"
        ]},
        { key: "extra", n: "Additional Java concepts", s: "fund", items: [
          "Packages", "Access modifiers", "Generics basics", "Static and final", "Multithreading fundamentals", "Thread versus process",
          "Thread lifecycle", "Runnable", "Synchronization basics", "Java 8 lambda expressions", "Functional interfaces", "Stream API basics",
          "JDBC fundamentals", I("PreparedStatement", "Precompiled, parameterised and safe from SQL injection, unlike Statement.")
        ]}
      ]},

    { key: "dbms", phase: "A", code: "A4", name: "DBMS", title: "Database Management Systems", p: "vhigh", short: "DBMS",
      blurb: "Pair every definition with a one-table example. Normalization, keys and ACID come up again in the generic DBMS assessment, so learn them properly now.",
      sections: [
        { key: "fund", n: "Database fundamentals", s: "fund", items: [
          "What is DBMS?", "What is RDBMS?", I("Database architecture", "Three-schema architecture (external, conceptual, internal); 1/2/3-tier."),
          "Tables, records and fields", "Relational model", "Schema", "ER diagrams", "Relationships", "Cardinality"
        ]},
        { key: "keys", n: "Keys", s: "fund", items: ["Primary key", "Foreign key", "Candidate key", "Super key", "Composite key", "Unique key"] },
        { key: "constraints", n: "Constraints", s: "fund", items: ["NOT NULL", "CHECK", "DEFAULT", "Referential integrity"] },
        { key: "norm", n: "Normalization", s: "fund", items: [
          "Functional dependency", "1NF", "2NF", "3NF", "BCNF basics", I("Database anomalies", "Insert, update and delete anomalies."), "Normalization benefits"
        ]},
        { key: "txn", n: "Transactions", s: "fund", items: [
          "ACID properties", "Atomicity", "Consistency", "Isolation", "Durability", "COMMIT", "ROLLBACK", "SAVEPOINT", "Transaction basics"
        ]},
        { key: "adv", n: "Additional DBMS", s: "fund", items: [
          "Indexing", "Views", "Stored procedures", "Triggers", "Database security", "Database backup and recovery", "Basic concurrency concepts"
        ]}
      ]},

    { key: "sql", phase: "A", code: "A5", name: "SQL", title: "SQL (hands-on)", p: "vhigh", short: "SQL", sqlLab: true,
      blurb: "Hands-on: write every query, don't just read it. The SQL Lab runs your queries on SQLite in the browser. That covers standard SQL; Oracle-only syntax (PL/SQL blocks, ROWNUM, MINUS) won't run there and is noted where it matters.",
      sections: [
        { key: "fund", n: "Commands", s: "fund", items: ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP", "TRUNCATE"] },
        { key: "filter", n: "Filtering and sorting", s: "fund", items: ["WHERE", "DISTINCT", "ORDER BY"] },
        { key: "agg", n: "Aggregates and grouping", s: "fund", items: ["Aggregate functions", "COUNT", "SUM", "AVG", "MIN", "MAX", "GROUP BY", "HAVING"] },
        { key: "joins", n: "Joins", s: "fund", items: [
          "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", I("FULL JOIN", "FULL OUTER JOIN. Not in MySQL: emulate with LEFT JOIN UNION RIGHT JOIN."), "SELF JOIN", "CROSS JOIN"
        ]},
        { key: "sub", n: "Subqueries", s: "fund", items: ["Subqueries", "Nested queries", "Correlated subqueries", "IN and EXISTS"] },
        { key: "adv", n: "Set operations, CASE, NULLs, views, PL/SQL", s: "fund", items: [
          "UNION", "UNION ALL", "CASE statements", "NULL handling", "Views", "Basic indexing",
          I("Basic PL/SQL concepts", "Oracle's procedural extension: DECLARE / BEGIN / EXCEPTION / END blocks, variables, cursors, procedures, functions, triggers. Batch-dependent, and it can't run in the SQL Lab (SQLite).", "add")
        ]},
        { key: "problems", n: "Practical SQL problems", s: "fund", lab: true, items: [
          "Retrieve all employee records", "Filter employees by salary", "Find the second-highest salary", "Find the highest salary in each department",
          "Count employees by department", "Find duplicate records", "Find employees without a department", "Join Employee and Department tables",
          "Find employees earning above average salary", "Write nested queries", "Write queries using GROUP BY and HAVING", "Create and query views"
        ]}
      ]},

    { key: "mcq", phase: "A", code: "A6", name: "Technical MCQs", title: "Technical MCQs", p: "vhigh", short: "MCQs", mcq: true,
      blurb: "Objective-question practice for the four main categories. The question bank, timed practice and retry modes are in the MCQs tab. Tick a question type here once you score consistently well on it.",
      sections: [
        { key: "oop", n: "OOP with Java MCQs", s: "fund", subj: "oop", items: [
          "Conceptual OOP questions", "OOP inheritance questions", "Constructor execution questions", "OOP code-output questions"
        ]},
        { key: "java", n: "Advanced Java MCQs", s: "fund", subj: "java", items: [
          "Java syntax questions", "Code-output questions", "Exception handling questions", "Collections questions", "JVM/JDK/JRE questions", "String comparison questions"
        ]},
        { key: "dbms", n: "DBMS MCQs", s: "fund", subj: "dbms", items: [
          "Conceptual DBMS questions", "DBMS normalization questions", "Keys and constraints questions", "ACID questions"
        ]},
        { key: "sql", n: "SQL MCQs", s: "fund", subj: "sql", items: [
          "SQL query-output questions", "Join-output questions", "Nested query questions", "SQL command questions"
        ]}
      ]},

    /* ============================ PHASE B ============================ */
    { key: "fa1", phase: "B", code: "B1", name: "Java assessment (FA1)", title: "Programming Fundamentals / Java Assessment (FA1)", p: "vhigh", short: "Generic Java", workspace: "java",
      blurb: "One trainee reports the generic Java and DBMS assessments as separate evaluations with objective and hands-on parts, with mock tests before the final. Treat that as an example; your batch's instructions define the real pattern.",
      sections: [
        { key: "topics", n: "Java topics", s: "rep", items: [
          "Java programming fundamentals", "Java syntax", "Conditions and loops", "Methods", "Arrays", "Strings", "Number programs",
          "Basic DSA", "ArrayList", "Stack", "Queue", "OOP concepts"
        ]},
        { key: "skills", n: "Assessment skills", s: "rep", items: [
          "Java output prediction", "Java MCQs", I("Java hands-on problems", "Timed: read the problem, write, compile, test the given and edge cases."),
          "Debugging", I("Edge cases", "Empty input, single element, negatives, zero, duplicates, large values."), "Basic algorithm problem-solving"
        ]}
      ]},

    { key: "fa2", phase: "B", code: "B2", name: "DBMS / SQL assessment (FA2)", title: "Database Management / SQL Assessment (FA2)", p: "vhigh", short: "Generic DBMS", workspace: "dbms",
      blurb: "DBMS theory for objective questions plus hands-on SQL query writing. Practise in the SQL Lab, then write queries on paper or in the training environment without running them first.",
      sections: [
        { key: "theory", n: "DBMS theory", s: "rep", items: [
          "Database fundamentals", "Relational database concepts", "Keys", "Constraints", "Normalization", "Transactions", "ACID"
        ]},
        { key: "sql", n: "SQL", s: "rep", items: [
          "SQL SELECT statements", "Filtering", "Sorting", "Aggregate functions", "GROUP BY", "HAVING", "Joins", "Nested queries", "Subqueries", "Views",
          I("Basic PL/SQL concepts", "Only where your batch syllabus includes it.", "add"), "Practical query writing", "SQL debugging", "Query-output prediction"
        ]},
        { key: "practice", n: "Assessment practice", s: "rep", items: [
          "DBMS MCQ preparation", "SQL query exercises", "Hands-on SQL assessment practice"
        ]}
      ]},

    { key: "osit", phase: "B", code: "B3", name: "OS & IT fundamentals", title: "Operating Systems and IT Fundamentals", p: "medium", short: "OS & IT",
      blurb: "Additional foundation topics. Older trainee accounts and FAQs mention operating systems in the generic phase; whether your batch covers them, and how deeply, varies.",
      sections: [
        { key: "os", n: "Operating systems", s: "add", items: [
          "Introduction to operating systems", "Processes", "Threads", "Process states", "CPU scheduling basics", "Memory management",
          "Virtual memory basics", "File systems", I("Deadlocks", "Four conditions: mutual exclusion, hold and wait, no preemption, circular wait."), "Synchronization fundamentals"
        ]},
        { key: "it", n: "IT fundamentals", s: "add", items: ["Computer hardware and software basics", "Basic networking concepts"] }
      ]},

    { key: "seweb", phase: "B", code: "B4", name: "Software engineering & web", title: "Software Engineering and Web Fundamentals", p: "medium", short: "SE & Web",
      blurb: "Software engineering, SDLC and basic HTML/CSS. There are objective questions for this module in the MCQs tab under “Foundation extras”.",
      sections: [
        { key: "se", n: "Software engineering", s: "add", items: [
          "Software engineering basics", "SDLC", "Waterfall model", "Agile fundamentals", "Scrum fundamentals", "Software requirements",
          "Software design basics", "Testing fundamentals", "Software development scenarios"
        ]},
        { key: "html", n: "HTML", s: "add", items: ["Basic HTML", "HTML elements", "Forms", "Tables", "Links and images"] },
        { key: "css", n: "CSS", s: "add", items: ["Basic CSS", "Selectors", "Colors", "Spacing", "Box model", "Basic layouts"] },
        { key: "practice", n: "Small practical exercises", s: "add", items: [
          "Build a registration form page", "Build a timetable page with an HTML table", "Style a profile card using the box model",
          "Lay out a two-column page with CSS", "Describe a project using SDLC phases", "Foundation extras MCQs (SE, OS, HTML/CSS)"
        ]}
      ]},

    { key: "prof", phase: "B", code: "B5", name: "Professional & learning skills", title: "Professional and Learning Skills", p: "additional", short: "Professional", component: true,
      blurb: "Training components such as communication, teamwork and mandatory courses. These are part of the programme, not guaranteed technical exam sections. Infosys describes soft skills as part of the Foundation Program.",
      sections: [
        { key: "skills", n: "Professional and learning components", s: "off", items: [
          "Technical communication", "Presentation skills", "Teamwork", "Critical thinking", "Design thinking", "Problem-solving",
          "Professional behaviour", "Group assignments", "Learning assignments", "Mandatory course completion"
        ]}
      ]}
  ];

  /* Old v1 item ids → new ids for topics that were reworded/moved. Anything
     not listed is matched by text (same module first, then unique in phase A);
     the rest is kept in state.legacy, not deleted. */
  const ALIASES = {
    "coding.javafund.operators-and-precedence": "coding.javafund.operators",
    "coding.javafund.type-casting": "coding.javafund.type-conversion",
    "coding.javafund.if-else-and-nested-conditions": "coding.javafund.if-else",
    "coding.javafund.switch-statements": "coding.javafund.switch",
    "coding.javafund.methods-and-parameters": "coding.javafund.methods",
    "coding.javafund.user-input-using-scanner": "coding.javafund.basic-input-and-output",
    "coding.array.matrix-addition": "coding.array.basic-matrix-operations",
    "coding.solve.debugging-basic-java-programs": "fa1.skills.debugging",
    "coding.solve.handling-edge-cases": "fa1.skills.edge-cases",
    "coding.solve.dry-run-exercises": "fa1.skills.java-output-prediction",
    "dsa.ds.arraylist": "coding.dsa.arraylist",
    "dsa.ds.stack": "coding.dsa.stack",
    "dsa.ds.queue": "coding.dsa.queue",
    "dsa.search.linear-search": "coding.dsa.basic-searching",
    "dsa.sort.bubble-sort": "coding.dsa.basic-sorting",
    "dsa.complexity.time-complexity-basics": "coding.dsa.basic-time-complexity",
    "dsa.ex.frequency-counting": "coding.dsa.frequency-based-problems",
    "dsa.ex.basic-recursion-problems": "coding.dsa.basic-recursion",
    "oop.fund.classes-and-objects": "oop.fund.class-and-object",
    "oop.fund.default-constructors": "oop.fund.default-constructor",
    "oop.fund.parameterized-constructors": "oop.fund.parameterized-constructor",
    "oop.other.static-variables": "oop.fund.static-keyword",
    "oop.other.final-variables": "oop.fund.final-keyword",
    "oop.other.is-a-and-has-a-relationships": "oop.other.is-a-relationship",
    "oop.practical.implement-inheritance-using-person-and-employee": "oop.practical.implement-inheritance",
    "oop.practical.demonstrate-method-overloading": "oop.practical.implement-method-overloading",
    "oop.practical.demonstrate-method-overriding": "oop.practical.implement-method-overriding",
    "oop.practical.implement-abstraction-using-an-abstract-class": "oop.practical.create-an-abstract-class",
    "oop.practical.implement-multiple-interfaces": "oop.practical.implement-an-interface",
    "oop.practical.explain-encapsulation-through-getters-and-setters": "oop.practical.demonstrate-encapsulation",
    "oop.practical.predict-output-for-inheritance-and-polymorphism-programs": "oop.practical.predict-the-output-of-inheritance-programs",
    "java.arch.java-compilation-process": "java.arch.compilation-process",
    "java.memory.stack-and-heap-basics": "java.arch.stack-and-heap-basics",
    "java.memory.garbage-collection-fundamentals": "java.arch.garbage-collection-fundamentals",
    "java.memory.string-pool": "java.strings.string-pool",
    "java.memory.wrapper-classes": "java.strings.wrapper-classes",
    "java.memory.autoboxing": "java.strings.autoboxing",
    "java.memory.unboxing": "java.strings.unboxing",
    "java.collections.collections-overview": "java.collections.collection-framework",
    "java.generics.generic-classes": "java.extra.generics-basics",
    "java.threads.process-versus-thread": "java.extra.thread-versus-process",
    "java.threads.thread-lifecycle": "java.extra.thread-lifecycle",
    "java.threads.runnable-interface": "java.extra.runnable",
    "java.threads.synchronization-fundamentals": "java.extra.synchronization-basics",
    "java.java8.lambda-expressions": "java.extra.java-8-lambda-expressions",
    "java.java8.functional-interfaces": "java.extra.functional-interfaces",
    "java.java8.stream-api": "java.extra.stream-api-basics",
    "java.extra.packages": "java.extra.packages",
    "dbms.fund.tables-rows-and-columns": "dbms.fund.tables-records-and-fields",
    "dbms.fund.relational-database-concepts": "dbms.fund.relational-model",
    "dbms.fund.schema-and-instance": "dbms.fund.schema",
    "dbms.norm.advantages-of-normalization": "dbms.norm.normalization-benefits",
    "dbms.txn.transaction-fundamentals": "dbms.txn.transaction-basics",
    "dbms.txn.concurrency-control-basics": "dbms.adv.basic-concurrency-concepts",
    "sql.joins.full-outer-join": "sql.joins.full-join",
    "sql.adv.indexes": "sql.adv.basic-indexing",
    "sql.sub.exists": "sql.sub.in-and-exists",
    "sql.problems.find-employees-without-a-department": "sql.problems.find-employees-without-a-department",
    "sql.problems.count-employees-by-department": "sql.problems.count-employees-by-department",
    "extra.os.deadlock-and-the-four-coffman-conditions": "osit.os.deadlocks",
    "extra.os.virtual-memory-and-paging": "osit.os.virtual-memory-basics",
    "extra.os.cpu-scheduling-basics-fcfs-sjf-round-robin": "osit.os.cpu-scheduling-basics",
    "extra.os.memory-management-basics": "osit.os.memory-management",
    "extra.os.semaphores-and-mutex-basics": "osit.os.synchronization-fundamentals",
    "extra.se.sdlc-phases": "seweb.se.sdlc",
    "extra.se.waterfall-agile-and-spiral-models": "seweb.se.waterfall-model",
    "extra.se.scrum-basics-sprint-backlog-stand-up": "seweb.se.scrum-fundamentals",
    "extra.test.unit-integration-system-and-acceptance-testing": "seweb.se.testing-fundamentals",
    "oa.writing.clear-professional-communication": "prof.skills.technical-communication"
  };

  const STREAM_EXAMPLES = ["Java", "Java Full Stack", ".NET", "Big Data", "Mainframe", "SAP", "Cloud", "Cybersecurity", "Salesforce", "Oracle", "Testing", "Data Analytics"];
  const STREAM_NOTE = "Stream allocation depends on Infosys' business requirements and applicable internal allocation processes. Preparation and assessment performance can strengthen technical readiness but cannot guarantee a particular stream.";

  const ASSESS_TYPES = [
    ["pre", "Initial / Pre-test"], ["gjava", "Generic Java assessment"], ["gdbms", "Generic DBMS assessment"], ["mcq", "Objective MCQ assessment"],
    ["jhands", "Java hands-on assessment"], ["shands", "SQL hands-on assessment"], ["addl", "Additional foundation assessment"],
    ["stream", "Stream assessment"], ["cap", "Capstone evaluation"], ["retest", "Retest"], ["mock", "Mock assessment (practice)"]
  ];

  /* Shown only inside a clearly marked research note — never used to decide pass/fail. */
  const REPORTED_BENCHMARKS = [
    { src: "Trainee post on LinkedIn (Aug 2025)", text: "Generic phase: two mock tests before the final assessment; final reported as Java + DBMS hands-on (60 marks) plus an objective test (40 marks), needing 65+ in Java and in DBMS individually. Stream phase: FA1 and FA2, each needing 50+, with an average of 65+; capstone reported as 30 marks added to FA2." },
    { src: "Infosys statement to the press (Feb 2025)", text: "Infosys said trainees get three attempts to clear the internal assessments during foundation training, and that not clearing them means not continuing, a condition it said is in the offer contract. Your batch's own rules come from your training instructions." },
    { src: "Third-party 2026 guide (PapersAdda)", text: "Describes ~9 weeks of generic training then ~13 weeks of stream training, and an approximate 65% pass mark. Unverified secondary source." }
  ];

  const SOURCES = [
    { name: "Infosys — Global Education Center (Mysuru)", url: "https://www.infosys.com/careers/graduates/global-education-center.html", date: "Not available", cls: "off", rel: "Official",
      topics: "Official page for the Foundation Program campus. It refused automated access during research, so read it yourself; nothing on this page is quoted from it." },
    { name: "Infosys — “Get set, go” Foundation Program", url: "https://www.infosys.com/about/esg/social/employee-wellbeing/get-set-go-foundation-program.html", date: "Not available", cls: "off", rel: "Official",
      topics: "Official description of the programme for fresh recruits. Not readable automatically; listed so you can check the current structure yourself." },
    { name: "Infosys ESG Report 2025–26 — digital talent", url: "https://www.infosys.com/about/esg/reports/2025-26/social-digital-talent.html", date: "FY 2025–26", cls: "off", rel: "Official",
      topics: "Official reporting on training and talent development. Not readable automatically during research." },
    { name: "Infosys press release — Foundation Programme, Mysore (2012)", url: "https://www.infosys.com/newsroom/press-releases/documents/2012/foundation-programme-mysore.pdf", date: "2012", cls: "off", rel: "Official but old",
      topics: "Search snippets of this release describe a residential programme with generic and stream-specific training in technology areas, plus soft skills. The basis for the A/B/C phase structure and for listing professional skills. Durations have changed since 2012." },
    { name: "Business Standard and other press — trainees and internal assessments", url: "https://www.business-standard.com/companies/news/infosys-fires-trainees-fail-internal-evaluation-fist-job-it-sector-layoff-125021000595_1.html", date: "Feb 2025", cls: "off", rel: "Official statement, as reported by media",
      topics: "Coverage (also The Week, Storyboard18) of Infosys saying trainees get three attempts at internal assessments and must clear them to continue. Why the assessment tracker records attempts and retests. Shown as a research note, not hard-coded policy." },
    { name: "Reddit r/infosysmysore — selected for SE: generic and stream training", url: "https://www.reddit.com/r/infosysmysore/comments/1v9oudq/i_recently_got_selected_for_the_infosys_se_role/", date: "Jul 2026", cls: "recent", rel: "Trainee account; unverified",
      topics: "Supplied by you. Reddit blocks automated reading, so it was not quoted; read it for current generic/stream details." },
    { name: "Reddit r/infosysmysore — for SE in Mysore training", url: "https://www.reddit.com/r/infosysmysore/comments/1v7sgu6/for_se_in_mysore_training/", date: "Jul 2026", cls: "recent", rel: "Trainee account; unverified",
      topics: "Supplied by you; not readable automatically. Check it for batch-level tips." },
    { name: "Reddit r/infosys — Infosys Mysore 101 guide", url: "https://www.reddit.com/r/infosys/comments/1wk28ot/infosys_mysore_101_guide_for_absolute_dummies/", date: "Oct 2026", cls: "recent", rel: "Trainee account; unverified",
      topics: "Supplied by you; not readable automatically. Practical campus and training guide." },
    { name: "Naga Chaitanya Jalari — My journey: Infosys Mysore training (LinkedIn)", url: "https://www.linkedin.com/pulse/my-journey-infosys-mysore-training-days-learnings-naga-chaitanya-akrwc", date: "31 Aug 2025", cls: "recent", rel: "Single trainee account",
      topics: "Three parts: Generic training (Java, DBMS), Stream training (their stream: .NET + Angular), Capstone project. Two mocks before the generic final; hands-on + objective split; stream FA1/FA2; capstone marks added to FA2. The source of the generic Java/DBMS focus and the FA1/FA2 structure." },
    { name: "PapersAdda — Infosys Mysore training 2026", url: "https://papersadda.com/article/infosys-mysore-training-2026/", date: "2026", cls: "recent", rel: "Third-party summary; unverified",
      topics: "~9 weeks generic (programming, OOP, DBMS) then ~13 weeks stream; says allocation is partly performance and partly random; example streams. Used only for the stream examples." },
    { name: "Careers360 Q&A — syllabus for Infosys training in Mysore", url: "https://www.careers360.com/question-what-is-syllabus-for-infosys-training-in-mysore", date: "Older (undated)", cls: "hist", rel: "Forum answer; low",
      topics: "Older trainee answer describing generic training then stream allocation, which it calls random. Shows how allocation accounts conflict, hence the stream disclaimer." },
    { name: "Older FAQ / forum accounts (PaGaLGuY, Scribd FAQ)", url: "https://www.pagalguy.com/t/infosys-recruitment-pagalguy/3026519?page=71", date: "2010s", cls: "hist", rel: "Historical; low",
      topics: "Generic phase covering programming, RDBMS, operating systems and software engineering, the basis for modules B3 and B4. Some posts describe 4 modules per stream with MCQ and hands-on tests. Patterns have changed since." },
    { name: "dev.java — Learn Java (Oracle)", url: "https://dev.java/learn/", date: "Maintained", cls: "add", rel: "Authoritative learning resource",
      topics: "Java language, OOP, exceptions, collections, streams (phase A modules A1–A3)." },
    { name: "SQLBolt — interactive SQL lessons", url: "https://sqlbolt.com/", date: "Maintained", cls: "add", rel: "Learning resource",
      topics: "Extra SQL practice alongside the SQL Lab (A5, B2)." },
    { name: "MDN — Learn web development (HTML/CSS)", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development", date: "Maintained", cls: "add", rel: "Authoritative learning resource",
      topics: "HTML elements, forms, tables, CSS selectors, box model, layout (B4)." }
  ];

  const SOURCE_CLASSES = {
    off: "Official Infosys information",
    recent: "Recent candidate experience",
    hist: "Historical training experience",
    add: "Additional recommended technical learning"
  };
  const CLASSES = {
    off: ["Official", "Published by Infosys"],
    rep: ["Trainee-reported", "Reported in trainee experiences, not official"],
    fund: ["Fundamental", "Common technical fundamentals"],
    add: ["Batch-dependent", "Additional / batch-dependent preparation"]
  };
  const PRIORITY = { vhigh: ["Very high", 0], high: ["High", 1], medium: ["Medium", 2], additional: ["Additional", 3] };

  return { PHASES, MODULES, ALIASES, STREAM_EXAMPLES, STREAM_NOTE, ASSESS_TYPES, REPORTED_BENCHMARKS, SOURCES, SOURCE_CLASSES, CLASSES, PRIORITY };
})();
