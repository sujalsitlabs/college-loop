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

const categories = [
  "Books",
  "Electronics",
  "Stationery",
  "Accessories",
  "Other",
];

function getImages(imageData?: string | string[]) {
  if (Array.isArray(imageData)) return imageData;
  if (imageData) return [imageData];
  return [];
}

export default function EditPage() {
  const [item, setItem] = useState<Item | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Books");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("collegeLoopSelectedItem");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      setItem(parsed);
      setName(parsed.name || "");
      setPrice(parsed.price !== undefined ? String(parsed.price) : "");
      setCategory(parsed.category || "Other");
      setDescription(parsed.description || "");
      setImages(getImages(parsed.imageData));
    } catch (error) {
      console.error("Unable to load listing:", error);
    }
  }, []);

  const compressImage = (
    file: File
  ): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement("canvas");

          const maxSize = 700;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Canvas not supported"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };

        img.onerror = () => reject(new Error("Invalid image"));

        img.src = reader.result as string;
      };

      reader.onerror = () =>
        reject(new Error("Unable to read image"));

      reader.readAsDataURL(file);
    });

  const handleImages = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    const remainingSlots = 5 - images.length;

    if (remainingSlots <= 0) {
      setMessage("Maximum 5 photos allowed.");
      return;
    }

    const selectedFiles = files.slice(0, remainingSlots);

    try {
      const compressedImages = await Promise.all(
        selectedFiles.map((file) => compressImage(file))
      );

      setImages((current) => [
        ...current,
        ...compressedImages,
      ]);

      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Some images could not be uploaded.");
    }

    event.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  const saveChanges = () => {
    if (!item) return;

    if (!name.trim()) {
      setMessage("Please enter an item name.");
      return;
    }

    if (!price.trim()) {
      setMessage("Please enter a price.");
      return;
    }

    if (!description.trim()) {
      setMessage("Please enter a description.");
      return;
    }

    try {
      const savedItems = JSON.parse(
        localStorage.getItem("collegeLoopItems") || "[]"
      );

      const updatedItems = savedItems.map((product: Item) =>
        String(product.id) === String(item.id)
          ? {
              ...product,
              name: name.trim(),
              price: price.trim(),
              category,
              description: description.trim(),
              imageData: images,
            }
          : product
      );

      localStorage.setItem(
        "collegeLoopItems",
        JSON.stringify(updatedItems)
      );

      const updatedItem = {
        ...item,
        name: name.trim(),
        price: price.trim(),
        category,
        description: description.trim(),
        imageData: images,
      };

      localStorage.setItem(
        "collegeLoopSelectedItem",
        JSON.stringify(updatedItem)
      );

      setMessage("Changes saved successfully! ✅");

      setTimeout(() => {
        window.location.href = "/product";
      }, 700);
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to save changes. Storage may be full."
      );
    }
  };

  if (!item) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: "40px 20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>Listing not found</h2>

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
          onClick={() => (window.location.href = "/product")}
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            background: "white",
            cursor: "pointer",
          }}
        >
          ← Cancel
        </button>
      </nav>

      {/* EDIT FORM */}
      <section
        style={{
          maxWidth: "850px",
          margin: "40px auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "18px",
            boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
          }}
        >
          <h1
            style={{
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            Edit Listing
          </h1>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "30px",
            }}
          >
            Update your item's details, price, description or photos.
          </p>

          {/* ITEM NAME */}
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Item Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter item name"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "15px",
            }}
          />

          {/* PRICE */}
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Price (₹)
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "15px",
            }}
          />

          {/* CATEGORY */}
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "13px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "15px",
              background: "white",
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* DESCRIPTION */}
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your item..."
            rows={6}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              marginBottom: "25px",
              fontSize: "15px",
              resize: "vertical",
            }}
          />

          {/* PHOTOS */}
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Product Photos
          </label>

          <p
            style={{
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            You can keep, remove or add photos. Maximum 5 photos.
          </p>

          {/* EXISTING IMAGES */}
          {images.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "12px",
                marginTop: "15px",
                marginBottom: "20px",
              }}
            >
              {images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  style={{
                    position: "relative",
                    height: "120px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
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

                  <button
                    onClick={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      border: "none",
                      background: "#ef4444",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ADD PHOTOS */}
          {images.length < 5 && (
            <label
              style={{
                display: "block",
                padding: "18px",
                border: "2px dashed #d1d5db",
                borderRadius: "10px",
                textAlign: "center",
                cursor: "pointer",
                marginBottom: "25px",
              }}
            >
              📷 Add More Photos

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                style={{
                  display: "none",
                }}
              />
            </label>
          )}

          {/* MESSAGE */}
          {message && (
            <div
              style={{
                padding: "12px",
                marginBottom: "18px",
                borderRadius: "8px",
                background: message.includes("successfully")
                  ? "#dcfce7"
                  : "#fee2e2",
                color: message.includes("successfully")
                  ? "#166534"
                  : "#991b1b",
              }}
            >
              {message}
            </div>
          )}

          {/* SAVE */}
          <button
            onClick={saveChanges}
            style={{
              width: "100%",
              padding: "15px",
              border: "none",
              borderRadius: "10px",
              background: "#111827",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            💾 Save Changes
          </button>
        </div>
      </section>
    </main>
  );
}