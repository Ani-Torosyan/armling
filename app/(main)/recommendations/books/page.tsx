"use client";

import { useEffect, useState } from "react";

const BooksPage = () => {
  const [books, setBooks] = useState<any[]>([]);  // Any type for the books response
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Predefined genres and levels for testing
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
        console.log("API Response:", json);  // Output the API response to console

        if (json.success) {
          setBooks(json.data);  // Set books if successful response
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
  }, []);  // Empty dependency array to run the effect only once

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div>
          <h1>Books Data from API:</h1>
          <pre>{JSON.stringify(books, null, 2)}</pre>  {/* Output the books data received from the API */}
        </div>
      )}
    </div>
  );
};

export default BooksPage;



