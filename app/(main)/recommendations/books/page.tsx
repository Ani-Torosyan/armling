"use client";

import { useEffect, useState } from "react";

const BooksPage = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedGenres = ["Դրամա"];
  const selectedLevels = ["B1"];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://book-api-dh5c.onrender.com/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            genres: selectedGenres,
            levels: selectedLevels,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const json = await res.json();
        if (json.success) {
          setBooks(json.data);
        } else {
          setError("Failed to load books.");
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("An error occurred while fetching books.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Recommended Books</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!loading &&
          !error &&
          books.map((book, idx) => (
            <a
              key={idx}
              href={book["Book URL"]}
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-transform duration-300 block"
            >
              <div className="flex flex-col h-full bg-white shadow-md rounded-xl overflow-hidden border hover:shadow-lg transition duration-300">
                <div className="h-64 w-full overflow-hidden bg-gray-100">
                  <img
                    src={book["Image URL"]}
                    alt={book.Title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between flex-grow p-4">
                  <div>
                    <h2 className="text-xl font-semibold">{book.Title}</h2>
                    <p className="text-gray-600">Author: {book.Author}</p>
                    <p className="text-gray-600">Genres: {book.Genres}</p>
                  </div>
                  <p className="text-gray-600 mt-2">Age: {book.Age}+</p>
                </div>
              </div>
            </a>
          ))}
      </div>
    </div>
  );
};

export default BooksPage;
