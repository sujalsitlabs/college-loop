"use client";

import { useState } from "react";

export default function SellPage() {
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Books");
  const [description, setDescription] = useState("");
  const [imageData, setImageData] = useState<string[]>([]);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const handleImages = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    if (files.length > 5) {
      setMessage("You can upload maximum 5 images.");
      return;
    }

    const compressedImages: string[] = [];
    const names: string[] = [];

    let completed = 0;

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement("canvas");

          const maxWidth = 1000;
          const maxHeight = 1000;

          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          if (!ctx) return;

          ctx.drawImage(img, 0, 0, width, height);

          const compressedImage = canvas.toDataURL(
            "image/jpeg",
            0.7
          );

          compressedImages.push(compressedImage);
          names.push(file.name);

          completed++;

          if (completed === files.length) {
            setImageData(compressedImages);
            setImageNames(names);
            setMessage("");
          }
        };

        img.src = reader.result as string;
      };

      reader.readAsDataURL(file);
    });
  };

  const listItem = () => {
    if (!itemName || !price || !description) {
      setMessage("Please fill all required details.");
      return;
    }

    const newItem = {
      itemName,
      price,
      category,
      description,
      imageName: imageNames.join(", "),
      imageData,
    };

    const oldItems = JSON.parse(
      localStorage.getItem("collegeLoopItems") || "[]"
    );

    try {
      localStorage.setItem(
        "collegeLoopItems",
        JSON.stringify([...oldItems, newItem])
      );

      setMessage("Item listed successfully! 🎉");

      setItemName("");
      setPrice("");
      setCategory("Books");
      setDescription("");
      setImageData([]);
      setImageNames([]);
    } catch (error) {
      setMessage(
        "Images are still too large. Please use smaller images."
      );
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6">

        <h1 className="text-3xl font-bold text-blue-600">
          Sell an Item
        </h1>

        <p className="text-gray-500 mt-2">
          Give your old college item a new owner.
        </p>

        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="w-full border rounded-lg p-3 mt-6"
        />

        <input
          type="number"
          placeholder="Price (₹)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded-lg p-3 mt-4"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded-lg p-3 mt-4"
        >
          <option>Books</option>
          <option>Electronics</option>
          <option>Stationery</option>
          <option>Accessories</option>
          <option>Other</option>
        </select>

        <label className="block mt-4 font-semibold text-gray-700">
          Item Images
        </label>

        <p className="text-sm text-gray-500 mt-1">
          You can upload up to 5 images.
        </p>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImages}
          className="w-full border rounded-lg p-3 mt-2"
        />

        {imageData.length > 0 && (
          <div className="mt-5">
            <p className="font-semibold text-gray-700 mb-3">
              Image Preview ({imageData.length}/5)
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {imageData.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl border"
                  />

                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <textarea
          placeholder="Describe your item..."
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded-lg p-3 mt-4"
        />

        <button
          onClick={listItem}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-6"
        >
          List Item
        </button>

        {message && (
          <p className="text-green-600 text-center font-semibold mt-4">
            {message}
          </p>
        )}

      </div>
    </main>
  );
}