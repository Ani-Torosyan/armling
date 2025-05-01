"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; 

const BooksPage = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const booksPerPage = 10;
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

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

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

  const totalPages = Math.ceil(books.length / booksPerPage);
  const paginatedBooks = books.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = (totalPages: number, currentPage: number) => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 3) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  const paginationPages = getPageNumbers(totalPages, currentPage);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Recommended Books</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {!loading &&
          !error &&
          paginatedBooks.map((book, idx) => (
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
                    <h2 className="text-lg font-semibold">{book.Title}</h2>
                    <p className="text-gray-600 text-sm">Author: {book.Author}</p>
                    <p className="text-gray-600 text-sm">Genres: {book.Genres}</p>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">Age: {book.Age}+</p>
                </div>
              </div>
            </a>
          ))}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center mt-10 flex-wrap gap-2 items-center">
          <Button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            variant="default"
          >
            Previous
          </Button>

          {paginationPages.map((page, idx) =>
            typeof page === "number" ? (
              <Button
                key={idx}
                onClick={() => handlePageClick(page)}
                variant={currentPage === page ? "default" : "ghost"}
              >
                {page}
              </Button>
            ) : (
              <span
                key={idx}
                className="px-2 text-gray-500 font-semibold select-none"
              >
                ...
              </span>
            )
          )}

          <Button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="default"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default BooksPage;
