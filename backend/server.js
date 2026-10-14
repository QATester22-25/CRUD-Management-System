const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

//Middlewares
app.use(cors());
app.use(express.json());

//Route de test
app.get("/", (req, res) => {
  res.send("API de gestion des produits opérationnèlles!")
});

//Récuperer tous les produits
app.get("/api/products", async (req, res) => {
  try {
  const [products] = await db.query("SELECT * FROM products ORDER BY id DESC");
    res.json(products);
  } catch (error) {
    console.error("Erreur lors de la récupération :", error)
  }
});

//Ajouter un produit
app.post("/api/products", async (req, res) => {
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
app.put("/api/products/:id", async (req, res) => {
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
      ]
    );

    if (result.affectedRows === 0) {
      const [rows] = await db.execute(
        "SELECT id FROM products WHERE id = ?",
        [Number(id)]
      );

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


// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
