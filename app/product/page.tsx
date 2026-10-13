
"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string | number;
  name?: string;
  price?: string | number;
  category?: string;
  description?: string;
  imageData?: string | string[];
  sellerName?: string;
  sold?: boolean;
};

export default function ProductPage() {
  const [item, setItem] = useState<Item | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const savedItem = localStorage.getItem("collegeLoopSelectedItem");

    if (!savedItem) return;

    try {
      const parsed = JSON.parse(savedItem);

      setItem(parsed);

      if (Array.isArray(parsed.imageData)) {
        setImages(parsed.imageData);
      } else if (parsed.imageData) {
        setImages([parsed.imageData]);
      }
    } catch (error) {
      console.error("Unable to load product:", error);
    }
  }, []);

  // EDIT LISTING
  const editItem = () => {
    if (!item) return;

    localStorage.setItem(
      "collegeLoopSelectedItem",
      JSON.stringify(item)
    );

    window.location.href = "/edit";
  };

  // MARK SOLD / AVAILABLE
  const markSold = (id: string | number) => {
    const savedItems = JSON.parse(
      localStorage.getItem("collegeLoopItems") || "[]"
    );

    const updatedItems = savedItems.map((product: Item) =>
      String(product.id) === String(id)
        ? { ...product, sold: !product.sold }
        : product
    );

    localStorage.setItem(
      "collegeLoopItems",
      JSON.stringify(updatedItems)
    );

    setItem((current) =>
      current ? { ...current, sold: !current.sold } : current
    );

    const selected = localStorage.getItem(
      "collegeLoopSelectedItem"
    );

    if (selected) {
      const selectedProduct = JSON.parse(selected);

      selectedProduct.sold = !selectedProduct.sold;

      localStorage.setItem(
        "collegeLoopSelectedItem",
        JSON.stringify(selectedProduct)
      );
    }
  };

  // DELETE LISTING
  const deleteItem = (id: string | number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) return;

    const savedItems = JSON.parse(
      localStorage.getItem("collegeLoopItems") || "[]"
    );

    const updatedItems = savedItems.filter(
      (product: Item) =>
        String(product.id) !== String(id)
    );

    localStorage.setItem(
      "collegeLoopItems",
      JSON.stringify(updatedItems)
    );

    localStorage.removeItem("collegeLoopSelectedItem");

    alert("Listing deleted successfully.");

    window.location.href = "/home";
  };

  if (!item) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px",
          fontFamily: "Arial, sans-serif",
          background: "#f8fafc",
        }}
      >
        <h2>Product not found</h2>

        <p>This product may have been removed.</p>

        <button
          onClick={() => (window.location.href = "/home")}
          style={{
            marginTop: "20px",
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            background: "#111827",
            color: "white",
            cursor: "pointer",
          }}
        >
          ← Back to Home
        </button>
      </main>
    );
  }

  const currentImage = images[selectedImage];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "Arial, sans-serif",
        paddingBottom: "50px",
      }}
    >
      {/* NAVBAR */}
      <nav
        style={{
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          padding: "18px 6%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            cursor: "pointer",
          }}
          onClick={() => (window.location.href = "/home")}
        >
          College Loop
        </h2>

        <button
          onClick={() => (window.location.href = "/home")}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "white",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
      </nav>

      {/* PRODUCT */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "40px auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            background: "white",
            padding: "30px",
            borderRadius: "18px",
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
          }}
        >
          {/* IMAGES */}
          <div>
            <div
              style={{
                height: "430px",
                background: "#f3f4f6",
                borderRadius: "14px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={item.name || "Product"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span style={{ color: "#9ca3af" }}>
                  No image available
                </span>
              )}
            </div>

            {/* THUMBNAILS */}
            {images.length > 1 && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                  overflowX: "auto",
                }}
              >
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: "75px",
                      height: "75px",
                      padding: 0,
                      border:
                        selectedImage === index
                          ? "3px solid #111827"
                          : "1px solid #d1d5db",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "white",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div>
            {/* CATEGORY */}
            <span
              style={{
                display: "inline-block",
                background: "#eef2ff",
                padding: "6px 10px",
                borderRadius: "20px",
                fontSize: "13px",
                color: "#4338ca",
              }}
            >
              {item.category || "Other"}
            </span>

            {/* SOLD STATUS */}
            <div style={{ marginTop: "12px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  background: item.sold
                    ? "#fee2e2"
                    : "#dcfce7",
                  color: item.sold
                    ? "#b91c1c"
                    : "#15803d",
                }}
              >
                {item.sold
                  ? "● Sold"
                  : "● Available"}
              </span>
            </div>

            {/* NAME */}
            <h1
              style={{
                fontSize: "32px",
                margin: "18px 0 10px",
              }}
            >
              {item.name || "Unnamed Item"}
            </h1>

            {/* PRICE */}
            <h2
              style={{
                fontSize: "28px",
                margin: "0 0 20px",
              }}
            >
              ₹{item.price ?? "Price not available"}
            </h2>

            {/* DESCRIPTION */}
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                borderBottom: "1px solid #e5e7eb",
                padding: "20px 0",
              }}
            >
              <h3>Description</h3>

              <p
                style={{
                  color: "#6b7280",
                  lineHeight: "1.7",
                }}
              >
                {item.description ||
                  "No description provided."}
              </p>
            </div>

            {/* SELLER */}
            <div style={{ marginTop: "25px" }}>
              <h3>Seller</h3>

              <p
                style={{
                  color: "#374151",
                  fontSize: "16px",
                }}
              >
                👤 {item.sellerName || "College Student"}
              </p>
            </div>

            {/* BUYER BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "25px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => {
                  alert(
                    "Seller contact feature will be connected soon."
                  );
                }}
                style={{
                  flex: 1,
                  minWidth: "180px",
                  padding: "14px",
                  border: "none",
                  borderRadius: "10px",
                  background: "#111827",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                💬 Contact Seller
              </button>

              <button
                onClick={() => {
                  const wishlist = JSON.parse(
                    localStorage.getItem(
                      "collegeLoopWishlist"
                    ) || "[]"
                  );

                  const exists = wishlist.some(
                    (id: string | number) =>
                      String(id) ===
                      String(item.id)
                  );

                  if (!exists) {
                    wishlist.push(item.id);

                    localStorage.setItem(
                      "collegeLoopWishlist",
                      JSON.stringify(wishlist)
                    );

                    alert(
                      "Added to wishlist ❤️"
                    );
                  } else {
                    alert(
                      "Already in wishlist ❤️"
                    );
                  }
                }}
                style={{
                  padding: "14px 20px",
                  border: "1px solid #d1d5db",
                  borderRadius: "10px",
                  background: "white",
                  cursor: "pointer",
                  fontSize: "15px",
                }}
              >
                ❤️ Wishlist
              </button>
            </div>

            {/* LISTING MANAGEMENT */}
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {/* EDIT BUTTON */}
              <button
                onClick={editItem}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "15px",
                }}
              >
                ✏️ Edit Listing
              </button>

              {/* SOLD / AVAILABLE */}
              <button
                onClick={() => markSold(item.id)}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "15px",
                }}
              >
                {item.sold
                  ? "✓ Mark Available"
                  : "Mark Sold"}
              </button>

              {/* DELETE */}
              <button
                onClick={() => deleteItem(item.id)}
                style={{
                  width: "100%",
                  padding: "13px",
                  borderRadius: "8px",
                  border: "1px solid #fecaca",
                  background: "#fff1f2",
                  color: "#b91c1c",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "15px",
                }}
              >
                🗑️ Delete Listing
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
