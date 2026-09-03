const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2");
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const pool = mysql.createPool({
  host: "sql.freedb.tech",
  user: "u_0T5tpu",
  password: "tMrDva3S7EQx",
  database: "freedb_NfJ9eJ9Z",
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});
//REPORT
app.get("/api/userdata", (req, res) => {
  pool.query("SELECT * FROM userdata", (err, rows, fields) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.status(500).json({ msg: "Failed to fetch users" });
    }
    res.json(rows.map(({ id, name, email, role }) => ({ id, name, email, role })));
  });
});
//CREATE
app.post("/api/userdata", (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email;
  const role = req.body.role?.trim();
  if (!name || !email || !role) {
    return res.status(400).json({ msg: "name, email, and role are required" });
  }

  pool.query(
    "INSERT INTO userdata (name, email, role) VALUES (?, ?, ?)",
    [name, email, role],
    (err, rows, fields) => {
      if (err) {
        console.error("Create error:", err);
        return res.status(500).json({ msg: "Failed to create user" });
      }
      res.status(201).json({ msg: "Successfully inserted!" });
    },
  );
});
//SEARCH
app.get("/api/userdata/:id", (req, res) => {
  const id = req.params.id;
  pool.query(
    "SELECT * FROM userdata WHERE id = ?", [id], (err, rows, fields) => {
      if (err) {
        console.error("Search error:", err);
        return res.status(500).json({ msg: "Failed to search user" });
      }
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ msg: `${id} id not found!` });
      }
    },
  );
});
//UPDATE
const updateUserdata = (req, res) => {
  const id = req.params.id || req.body.id;
  const originalEmail = req.body.originalEmail?.trim();
  const updates = {};

  if (req.body.name !== undefined) updates.name = req.body.name.trim();
  if (req.body.email !== undefined) updates.email = req.body.email.trim();
  if (req.body.role !== undefined) updates.role = req.body.role.trim();

  if ((!id && !originalEmail) || Object.keys(updates).length === 0 || Object.values(updates).some((value) => !value)) {
    return res.status(400).json({ msg: "id and at least one valid field are required" });
  }

  const fields = Object.keys(updates);
  const values = fields.map((field) => updates[field]);
  const assignments = fields.map((field) => `${field} = ?`).join(", ");

  pool.query(
    `UPDATE userdata SET ${assignments} WHERE ${originalEmail ? "email = ?" : "id = ?"} LIMIT 1`,
    [...values, originalEmail || id],
    (err, rows, fields) => {
      if (err) {
        console.error("Update error:", err);
        return res.status(500).json({ msg: "Failed to update user" });
      }
      if (rows.matchedRows === 0) {
        return res.status(404).json({ msg: "User not found" });
      }
      res.json({ msg: `Successfully updated` });
    },
  );
};

app.put("/api/userdata", updateUserdata);
app.put("/api/userdata/:id", updateUserdata);
app.patch("/api/userdata/:id", updateUserdata);
//DELETE
const deleteMember = (req, res) => {
  const id = req.params.id || req.body.id;
  if (!id) {
    return res.status(400).json({ msg: "id is required" });
  }

  pool.query("DELETE FROM userdata WHERE id = ?", [id], (err, rows, fields) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ msg: "Failed to delete user" });
    }
    if (rows.affectedRows === 0) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ msg: `Successfully deleted` });
  });
};

app.delete("/api/userdata", deleteMember);
app.delete("/api/userdata/:id", deleteMember);

app.listen(PORT, () => {
  console.log(`Server is running in port ${PORT}`);
});
