# CRUD Operations - User Management API

## 🚀 Project Run Karna

```bash
node index.js
```

Server start hoga: `http://localhost:3000`

---

## 📌 API Endpoints

### 1. CREATE - Naya User Banao (POST)
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Amit", "email": "amit@example.com", "age": 28}'
```

### 2. READ - Sabhi Users Dekho (GET)
```bash
curl http://localhost:3000/users
```

### 3. READ - Ek User Dekho (GET)
```bash
curl http://localhost:3000/users/1
```

### 4. UPDATE - User Update Karo (PUT)
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Rahul Kumar", "age": 26}'
```

### 5. DELETE - User Delete Karo (DELETE)
```bash
curl -X DELETE http://localhost:3000/users/1
```

---

## 📚 CRUD Kya Hai?

| Operation | HTTP Method | Matlab |
|-----------|-------------|--------|
| **C**reate | POST | Naya data banana |
| **R**ead | GET | Data padhna |
| **U**pdate | PUT/PATCH | Data update karna |
| **D**elete | DELETE | Data delete karna |

---

## 🛠️ Postman Se Test Karo

1. [Postman](https://www.postman.com/downloads/) download karo
2. Server start karo: `node index.js`
3. Postman mein API calls test karo

Happy Learning! 🎉
