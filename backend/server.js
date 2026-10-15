const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

//Middlewares
app.use(
  cors({
    origin: "http://localhost:5500",
    credentials: true,
  }),
);

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "secret-local-development",
  resave: false,
  saveUninitialized: false,
  cookies: {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60
  }
}));

app.get("/api/auth/me", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        authenticated: false,
        message: "Not logged in",
      });
    }

    res.json({
      authenticated: true,
      userId: req.session.userId,
    });
  } catch (error) {
    console.error("Session check error:", error);

    res.status(500).json({
      message: "Unable to verify session",
    });
  }
});

// PROTECT ROUTES
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Authentication required. Please log in."
        });
    }

    next();
}



//Route de test
app.get("/", (req, res) => {
  res.send("API de gestion des produits opérationnèlles!")
});

//Récuperer tous les produits
app.get("/api/products", requireAuth, async (req, res) => {
  try {
    const [products] = await db.query(
      "SELECT * FROM products ORDER BY id DESC",
    );
    res.json(products);
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
  }
});

//Ajouter un produit
app.post("/api/products", requireAuth, async (req, res) => {
  try {
    const { reference, title, category, count, price, discount } = req.body;

    //Vérification des données
    if (
      !reference ||
      !title ||
      !category ||
      count === undefined ||
      price === undefined ||
      discount === undefined
    ) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires.",
      });
    }

    const productCount = Number(count);
    const productPrice = Number(price);
    const productDiscount = Number(discount);

    if (
      !Number.isInteger(productCount) ||
      productCount < 0 ||
      !Number.isFinite(productPrice) ||
      productPrice < 0 ||
      !Number.isFinite(productDiscount) ||
      productDiscount < 0 ||
      productDiscount > 100
    ) {
      return res.status(400).json({
        message: "Les valeurs numériques sont invalides.",
      });
    }

    const sql = `
            INSERT INTO products
                (reference, title, category, count, price, discount)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

    const [result] = await db.execute(sql, [
      String(reference).trim(),
      String(title).trim(),
      String(category).trim(),
      productCount,
      productPrice,
      productDiscount,
    ]);

    res.status(201).json({
      message: "Produit ajouté avec succès.",
      id: result.insertId,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Cette référence existe déjà.",
      });
    }

    console.error("Erreur lors de l'ajout :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// UPDATE a product
app.put("/api/products/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reference, title, category, count, price, discount } = req.body;

    if (
      !reference?.trim() ||
      !title?.trim() ||
      !category?.trim() ||
      count === undefined ||
      price === undefined ||
      discount === undefined ||
      Number(count) <= 0 ||
      Number(price) <= 0 ||
      Number(discount) < 0 ||
      Number(discount) > 100
    ) {
      return res.status(400).json({
        message: "Invalid product data.",
      });
    }

    const [result] = await db.execute(
      `UPDATE products
       SET reference = ?, title = ?, category = ?,
           count = ?, price = ?, discount = ?
       WHERE id = ?`,
      [
        reference.trim(),
        title.trim(),
        category.trim(),
        Number(count),
        Number(price),
        Number(discount),
        Number(id),
      ],
    );

    if (result.affectedRows === 0) {
      const [rows] = await db.execute("SELECT id FROM products WHERE id = ?", [
        Number(id),
      ]);

      if (rows.length === 0) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }
    }

    return res.status(200).json({
      message: "Product updated successfully.",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Reference already exists, please try another!",
      });
    }

    console.error("Update product error:", error);

    return res.status(500).json({
      message: "Unable to update product.",
    });
  }
});

// DELETE a product
app.delete("/api/products/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute("DELETE FROM products WHERE id = ?", [
      Number(id),
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      message: "Unable to delete product.",
    });
  }
});


// DELETE ALL products
app.delete("/api/products", requireAuth, async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM products");

    return res.status(200).json({
      message: "All products deleted successfully.",
      deletedCount: result.affectedRows,
    });
  } catch (error) {
    console.error("Delete all products error:", error);

    return res.status(500).json({
      message: "Unable to delete all products.",
    });
  }
});


// SELL products
app.post("/api/products/:id/sale", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const quantity = Number(req.body.quantity);

    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        message: "Invalid product ID or quantity.",
      });
    }

    const [result] = await db.execute(
      `UPDATE products
       SET count = count - ?
       WHERE id = ? AND count >= ?`,
      [quantity, id, quantity],
    );

    if (result.affectedRows === 0) {
      const [products] = await db.execute(
        "SELECT id, count FROM products WHERE id = ?",
        [id],
      );

      if (products.length === 0) {
        return res.status(404).json({
          message: "Product not found.",
        });
      }

      return res.status(409).json({
        message: "Not enough products in stock!",
      });
    }

    const [products] = await db.execute("SELECT * FROM products WHERE id = ?", [
      id,
    ]);

    return res.status(200).json({
      message: "Sale completed successfully.",
      product: products[0],
    });
  } catch (error) {
    console.error("Sale error:", error);

    return res.status(500).json({
      message: "Unable to complete the sale.",
    });
  }
});


// REGISTER
app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Vérifier les champs obligatoires
        if (
          typeof username !== "string" ||
          typeof email !== "string" ||
          typeof password !== "string" ||
          !username.trim() ||
          !email.trim() ||
          !password
        ) {
          return res.status(400).json({
            message: "All fields are required.",
          });
        }

        // Vérifier la longueur du mot de passe
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must contain at least 8 characters."
            });
        }

        // Vérifier si l'email existe déjà
        const [existingUsers] = await db.execute(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email already registered."
            });
        }

        // Hasher le mot de passe
        const passwordHash = await bcrypt.hash(password, 12);

        // Enregistrer l'utilisateur dans MySQL
        const [result] = await db.execute(
            `INSERT INTO users (username, email, password_hash)
             VALUES (?, ?, ?)`,
            [username, email, passwordHash]
        );

        res.status(201).json({
            message: "Registration successful.",
            user: {
                id: result.insertId,
                username,
                email
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        // Rechercher l'utilisateur par email
        const [users] = await db.execute(
            `SELECT id, username, email, password_hash
             FROM users
             WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        // Comparer le mot de passe avec son hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Créer une session pour l'utilisateur
        req.session.userId = user.id;

        res.json({
            message: "Login successful.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Internal server error."
        });
    }
});

// LOGOUT
app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                message: "Could not log out."
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            message: "Logout successful."
        });
    });
});


// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
