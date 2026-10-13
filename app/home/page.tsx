"use client";

import { useEffect, useState } from "react";

type Item = {
  id: number;
  name: string;
  price: string;
  category: string;
  description: string;
  imageName?: string;
  imageData?: string | string[];
  seller?: string;
  sold?: boolean;
};

const categories = [
  "All",
  "Books",
  "Electronics",
  "Stationery",
  "Accessories",
  "Other",
];

function getImages(imageData?: string | string[]) {
  if (Array.isArray(imageData)) {
    return imageData.filter(Boolean);
  }

  if (imageData) {
    return [imageData];
  }

  return [];
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const maxSize = 700;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", 0.6);

        resolve(compressed);
      };

      img.onerror = () => reject(new Error("Image loading failed"));

      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error("File reading failed"));

    reader.readAsDataURL(file);
  });
}

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [wishlist, setWishlist] = useState<number[]>([]);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [showProfile, setShowProfile] = useState(false);

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editImageData, setEditImageData] = useState<string[]>([]);
  const [editImageNames, setEditImageNames] = useState<string[]>([]);

  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCategory, setEditCategory] = useState("Books");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    const savedItems = localStorage.getItem("collegeLoopItems");

    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        setItems(parsedItems);
      } catch {
        console.log("Could not load items");
      }
    }

    const savedWishlist = localStorage.getItem("collegeLoopWishlist");

    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {
        setWishlist([]);
      }
    }
  }, []);

  const saveItems = (newItems: Item[]) => {
    setItems(newItems);
    localStorage.setItem("collegeLoopItems", JSON.stringify(newItems));
  };

  const toggleWishlist = (id: number) => {
    let newWishlist: number[];

    if (wishlist.includes(id)) {
      newWishlist = wishlist.filter((itemId) => itemId !== id);
    } else {
      newWishlist = [...wishlist, id];
    }

    setWishlist(newWishlist);
    localStorage.setItem(
      "collegeLoopWishlist",
      JSON.stringify(newWishlist)
    );
  };

  const openItem = (item: Item) => {
    setSelectedItem(item);
    setSelectedImageIndex(0);
  };

  const closeItem = () => {
    setSelectedItem(null);
    setSelectedImageIndex(0);
  };

  const startEditing = (item: Item) => {
    setEditingItem(item);

    setEditName(item.name);
    setEditPrice(item.price);
    setEditCategory(item.category);
    setEditDescription(item.description);

    const images = getImages(item.imageData);

    setEditImageData(images);

    if (Array.isArray(item.imageName)) {
      setEditImageNames(item.imageName);
    } else if (item.imageName) {
      setEditImageNames([item.imageName]);
    } else {
      setEditImageNames([]);
    }

    closeItem();
  };

  const handleEditImages = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const selectedFiles = files.slice(0, 5);

    try {
      const compressedImages: string[] = [];
      const names: string[] = [];

      for (const file of selectedFiles) {
        const compressed = await compressImage(file);

        compressedImages.push(compressed);
        names.push(file.name);
      }

      setEditImageData(compressedImages);
      setEditImageNames(names);
    } catch {
      alert("Some images could not be uploaded.");
    }

    event.target.value = "";
  };

  const removeEditImage = (index: number) => {
    setEditImageData((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index)
    );

    setEditImageNames((prev) =>
      prev.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  const saveEditedItem = () => {
    if (!editingItem) return;

    if (!editName.trim()) {
      alert("Please enter item name.");
      return;
    }

    const updatedItem: Item = {
      ...editingItem,
      name: editName,
      price: editPrice,
      category: editCategory,
      description: editDescription,
      imageData: editImageData,
      imageName: editImageNames.join(", "),
    };

    const newItems = items.map((item) =>
      item.id === editingItem.id ? updatedItem : item
    );

    try {
      saveItems(newItems);
      setEditingItem(null);

      if (selectedItem?.id === updatedItem.id) {
        setSelectedItem(updatedItem);
      }

      alert("Listing updated successfully!");
    } catch {
      alert(
        "Could not save changes. Images may be too large. Try fewer/smaller images."
      );
    }
  };

  const deleteItem = (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmDelete) return;

    const newItems = items.filter((item) => item.id !== id);

    saveItems(newItems);

    if (selectedItem?.id === id) {
      closeItem();
    }
  };

  const markSold = (id: number) => {
    const newItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            sold: !item.sold,
          }
        : item
    );

    saveItems(newItems);

    if (selectedItem?.id === id) {
      const updated = newItems.find((item) => item.id === id);

      if (updated) {
        setSelectedItem(updated);
      }
    }
  };

  const contactSeller = (item: Item) => {
    alert(
      `Contact Seller\n\nSeller: ${
        item.seller || "College Loop Student"
      }\n\nContact feature can be connected to chat/WhatsApp later.`
    );
  };

  const filteredItems = items.filter((item) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      searchText === "" ||
      String(item.name ?? "").toLowerCase().includes(searchText) ||
String(item.description ?? "").toLowerCase().includes(searchText) ||
String(item.category ?? "").toLowerCase().includes(searchText)

    const matchesCategory =
      selectedCategory === "All" ||
      item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const selectedImages = selectedItem
    ? getImages(selectedItem.imageData)
    : [];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f8fa",
        color: "#1f2937",
      }}
    >
      {/* NAVBAR */}

      <nav
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 6%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              fontWeight: 800,
            }}
          >
            College Loop
          </h1>

          <p
            style={{
              margin: "2px 0 0",
              color: "#6b7280",
              fontSize: "12px",
            }}
          >
            Buy. Sell. Reuse. Within Your Campus.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setShowProfile(true)}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Profile
          </button>

          <button
            onClick={() => {
              window.location.href = "/sell";
            }}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#111827",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            + Sell Item
          </button>
        </div>
      </nav>

      {/* HERO */}

      <section
        style={{
          padding: "55px 6% 40px",
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(30px, 5vw, 50px)",
            margin: "0 0 12px",
            fontWeight: 800,
          }}
        >
          Find What You Need on Campus
        </h2>

        <p
          style={{
            color: "#6b7280",
            fontSize: "16px",
            marginBottom: "28px",
          }}
        >
          Buy affordable second-hand items from fellow students.
        </p>

        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books, engineering books, calculators, headphones..."
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "16px 20px",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              outline: "none",
              fontSize: "16px",
            }}
          />
        </div>
      </section>

      {/* CATEGORIES */}

      <section
        style={{
          padding: "25px 6%",
          background: "#f7f8fa",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: "9px 16px",
                borderRadius: "999px",
                border:
                  selectedCategory === category
                    ? "1px solid #111827"
                    : "1px solid #d1d5db",
                background:
                  selectedCategory === category
                    ? "#111827"
                    : "#ffffff",
                color:
                  selectedCategory === category
                    ? "#ffffff"
                    : "#374151",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* LISTINGS */}

      <section
        style={{
          padding: "30px 6% 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "22px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Available Items</h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              {filteredItems.length} item
              {filteredItems.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "14px",
              padding: "50px 20px",
              textAlign: "center",
            }}
          >
            <h3>No items found</h3>

            <p style={{ color: "#6b7280" }}>
              Try another search or category.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "22px",
            }}
          >
            {filteredItems.map((item, index) => {
              const images = getImages(item.imageData);
              const mainImage = images[0];

              return (
                <div
                  key={`${item.id}-${index}`}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "14px",
                    overflow: "hidden",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
                    position: "relative",
                  }}
                >
                  {/* IMAGE */}

                  <div
                    style={{
                      height: "210px",
                      background: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          color: "#9ca3af",
                          fontSize: "15px",
                        }}
                      >
                        No Image
                      </span>
                    )}

                    {images.length > 1 && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "10px",
                          background: "rgba(0,0,0,0.7)",
                          color: "#ffffff",
                          padding: "5px 9px",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      >
                        📷 {images.length} photos
                      </span>
                    )}

                    {item.sold && (
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          background: "#dc2626",
                          color: "#ffffff",
                          padding: "5px 9px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                        }}
                      >
                        SOLD
                      </span>
                    )}

                    <button
                      onClick={() => toggleWishlist(item.id)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        border: "none",
                        background: "#ffffff",
                        cursor: "pointer",
                        fontSize: "20px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      {wishlist.includes(item.id) ? "❤️" : "🤍"}
                    </button>
                  </div>

                  {/* CARD CONTENT */}

                  <div style={{ padding: "17px" }}>
                    <p
                      style={{
                        margin: "0 0 7px",
                        fontSize: "12px",
                        color: "#6b7280",
                        fontWeight: 600,
                      }}
                    >
                      {item.category}
                    </p>

                    <h3
                      style={{
                        margin: "0 0 7px",
                        fontSize: "18px",
                      }}
                    >
                      {item.name}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 12px",
                        color: "#6b7280",
                        fontSize: "14px",
                        minHeight: "40px",
                      }}
                    >
                      {item.description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "13px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "20px",
                        }}
                      >
                        ₹{item.price || "0"}
                      </strong>

                      <span
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {item.seller || "Student"}
                      </span>
                    </div>

                    <button
                      onClick={() => {
  localStorage.setItem("collegeLoopSelectedItem", JSON.stringify(item));
  window.location.href = "/product";
}}
                      style={{
                        width: "100%",
                        padding: "11px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#111827",
                        color: "#ffffff",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      View Item
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CONTACT US */}

      <section
        style={{
          padding: "55px 6%",
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <h2>Need Help?</h2>

        <p
          style={{
            color: "#6b7280",
            maxWidth: "600px",
            margin: "0 auto 20px",
          }}
        >
          Having an issue with buying, selling, or using College Loop?
          Contact us for assistance.
        </p>

        <button
          onClick={() =>
            alert(
              "Contact Us\n\nEmail: support@collegeloop.com\n\nThis can be connected to a real support system later."
            )
          }
          style={{
            padding: "12px 22px",
            borderRadius: "8px",
            border: "1px solid #111827",
            background: "#ffffff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Contact Us
        </button>
      </section>

      {/* RATE US - LAST SECTION */}

      <section
        style={{
          padding: "60px 6%",
          background: "#111827",
          color: "#ffffff",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: "30px",
          }}
        >
          Rate Us ⭐
        </h2>

        <p
          style={{
            color: "#d1d5db",
          }}
        >
          Help us improve College Loop with your feedback.
        </p>

        <button
          onClick={() => {
            const rating = window.prompt(
              "Rate College Loop from 1 to 5 stars:"
            );

            if (rating) {
              alert(`Thank you for rating College Loop ${rating}/5 ⭐`);
            }
          }}
          style={{
            padding: "12px 25px",
            borderRadius: "8px",
            border: "none",
            background: "#ffffff",
            color: "#111827",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Give Your Rating
        </button>
      </section>

      {/* PROFILE MODAL */}

      {showProfile && (
        <div
          onClick={() => setShowProfile(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "430px",
              borderRadius: "15px",
              padding: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ margin: 0 }}>My Profile</h2>

              <button
                onClick={() => setShowProfile(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "22px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                marginTop: "25px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  background: "#f3f4f6",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: "28px",
                  }}
                >
                  {items.length}
                </strong>

                <span>Listings</span>
              </div>

              <div
                style={{
                  padding: "20px",
                  background: "#f3f4f6",
                  borderRadius: "10px",
                  textAlign: "center",
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: "28px",
                  }}
                >
                  {wishlist.length}
                </strong>

                <span>Wishlist</span>
              </div>
            </div>

            <button
              onClick={() => {
                window.location.href = "/sell";
              }}
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "12px",
                border: "none",
                borderRadius: "8px",
                background: "#111827",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              + Sell New Item
            </button>
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS MODAL */}

      {selectedItem && (
        <div
          onClick={closeItem}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "850px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "16px",
              padding: "25px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0 }}>Item Details</h2>

              <button
                onClick={closeItem}
                style={{
                  border: "none",
                  background: "#f3f4f6",
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1.1fr) minmax(0, 0.9fr)",
                gap: "30px",
              }}
            >
              {/* GALLERY */}

              <div>
                <div
                  style={{
                    height: "380px",
                    background: "#f3f4f6",
                    borderRadius: "12px",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {selectedImages.length > 0 ? (
                    <img
                      src={selectedImages[selectedImageIndex]}
                      alt={selectedItem.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <span style={{ color: "#9ca3af" }}>
                      No Image
                    </span>
                  )}

                  {selectedImages.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            (prev) =>
                              prev === 0
                                ? selectedImages.length - 1
                                : prev - 1
                          )
                        }
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          border: "none",
                          background: "rgba(0,0,0,0.65)",
                          color: "#ffffff",
                          cursor: "pointer",
                          fontSize: "22px",
                        }}
                      >
                        ‹
                      </button>

                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            (prev) =>
                              prev === selectedImages.length - 1
                                ? 0
                                : prev + 1
                          )
                        }
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "42px",
                          height: "42px",
                          borderRadius: "50%",
                          border: "none",
                          background: "rgba(0,0,0,0.65)",
                          color: "#ffffff",
                          cursor: "pointer",
                          fontSize: "22px",
                        }}
                      >
                        ›
                      </button>

                      <span
                        style={{
                          position: "absolute",
                          bottom: "12px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "rgba(0,0,0,0.7)",
                          color: "#ffffff",
                          padding: "5px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                        }}
                      >
                        {selectedImageIndex + 1} /{" "}
                        {selectedImages.length}
                      </span>
                    </>
                  )}
                </div>

                {/* THUMBNAILS */}

                {selectedImages.length > 1 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "12px",
                      overflowX: "auto",
                    }}
                  >
                    {selectedImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        style={{
                          padding: 0,
                          border:
                            selectedImageIndex === index
                              ? "3px solid #111827"
                              : "2px solid #d1d5db",
                          borderRadius: "8px",
                          overflow: "hidden",
                          minWidth: "70px",
                          height: "70px",
                          cursor: "pointer",
                          background: "#ffffff",
                        }}
                      >
                        <img
                          src={image}
                          alt={`Photo ${index + 1}`}
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
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {selectedItem.category}
                </p>

                <h2
                  style={{
                    fontSize: "30px",
                    margin: "5px 0 10px",
                  }}
                >
                  {selectedItem.name}
                </h2>

                <h3
                  style={{
                    fontSize: "25px",
                    margin: "0 0 20px",
                  }}
                >
                  ₹{selectedItem.price || "0"}
                </h3>

                <p
                  style={{
                    color: "#4b5563",
                    lineHeight: 1.6,
                  }}
                >
                  {selectedItem.description}
                </p>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    background: "#f3f4f6",
                    borderRadius: "10px",
                  }}
                >
                  <strong>Seller</strong>

                  <p
                    style={{
                      margin: "5px 0 0",
                    }}
                  >
                    {selectedItem.seller ||
                      "College Loop Student"}
                  </p>
                </div>

                {selectedItem.sold && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "12px",
                      background: "#fee2e2",
                      color: "#991b1b",
                      borderRadius: "8px",
                      fontWeight: 700,
                      textAlign: "center",
                    }}
                  >
                    This item has been sold.
                  </div>
                )}

                <button
                  onClick={() => contactSeller(selectedItem)}
                  disabled={selectedItem.sold}
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    padding: "13px",
                    borderRadius: "8px",
                    border: "none",
                    background: selectedItem.sold
                      ? "#9ca3af"
                      : "#111827",
                    color: "#ffffff",
                    cursor: selectedItem.sold
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: 700,
                  }}
                >
                  Contact Seller
                </button>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginTop: "10px",
                  }}
                >
                  <button
                    onClick={() => startEditing(selectedItem)}
                    style={{
                      padding: "11px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      background: "#ffffff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => markSold(selectedItem.id)}
                    style={{
                      padding: "11px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      background: "#ffffff",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {selectedItem.sold
                      ? "✓ Available"
                      : "Mark Sold"}
                  </button>
                </div>

                <button
                  onClick={() => deleteItem(selectedItem.id)}
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "11px",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                    background: "#fff1f2",
                    color: "#b91c1c",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  🗑️ Delete Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}

      {editingItem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "16px",
              padding: "25px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0 }}>Edit Listing</h2>

              <button
                onClick={() => setEditingItem(null)}
                style={{
                  border: "none",
                  background: "#f3f4f6",
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Item Name
            </label>

            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                marginBottom: "15px",
              }}
            />

            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Price
            </label>

            <input
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              type="number"
              placeholder="Enter price"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                marginBottom: "15px",
              }}
            />

            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Category
            </label>

            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                marginBottom: "15px",
              }}
            >
              {categories
                .filter((category) => category !== "All")
                .map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
            </select>

            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Description
            </label>

            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                marginBottom: "18px",
                resize: "vertical",
              }}
            />

            {/* IMAGE EDITING */}

            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Product Images
            </label>

            <p
              style={{
                color: "#6b7280",
                fontSize: "13px",
                marginTop: 0,
              }}
            >
              Select up to 5 images. Selecting new images will replace
              the current images.
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleEditImages}
              style={{
                marginBottom: "15px",
              }}
            />

            {editImageData.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: "10px",
                  marginBottom: "20px",
                }}
              >
                {editImageData.map((image, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      height: "100px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      border: "1px solid #d1d5db",
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
                      onClick={() => removeEditImage(index)}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        width: "25px",
                        height: "25px",
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(0,0,0,0.7)",
                        color: "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>

                    <span
                      style={{
                        position: "absolute",
                        bottom: "4px",
                        left: "5px",
                        background: "rgba(0,0,0,0.65)",
                        color: "#ffffff",
                        padding: "2px 5px",
                        borderRadius: "4px",
                        fontSize: "11px",
                      }}
                    >
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setEditingItem(null)}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>

              <button
                onClick={saveEditedItem}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#111827",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}