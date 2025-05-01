"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

const allGenres = [
  "Դրամա", "Կենսագրություն", "Պոեզիա", "Պատմական գեղարվեստական գրականություն", "Կատակերգություն", "Ռոմանս",
  "Թրիլլեր", "Առեղծված", "Երիտասարդական", "Դետեկտիվ", "Ժամանակակից", "Դիստոպիա", "Սարսափ",
  "Գիտական ֆանտաստիկա", "Արկածային", "Ֆանտաստիկա", "Մանկական գրականություն"
];

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

const FilterPopover = ({
  genres,
  levels,
  selectedGenres,
  setSelectedGenres,
  selectedLevel,
  setSelectedLevel,
  fetchBooks,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !(popoverRef.current as any).contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev: string[]) =>
      prev[0] === genre ? [] : [genre]
    );
  };
  

  return (
    <div className="relative inline-block mb-6">
      <Button onClick={() => setIsOpen(!isOpen)}>
        FILTER
      </Button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-3 w-80 bg-white rounded-xl shadow-lg p-4 space-y-4"
        >
          <div>
            <h3 className="text-sm font-medium mb-2">Genres</h3>
            <div className="max-h-32 overflow-y-auto pr-1 flex flex-wrap gap-2">
              {genres.map((genre: string) => {
                const selected = selectedGenres.includes(genre);
                return (
                  <Button
                    key={genre}
                    variant={selected ? "default" : "ghost"}
                    onClick={() => toggleGenre(genre)}
                    className="text-xs px-3 py-1 rounded-full"
                  >
                    {genre}
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Levels</h3>
            <div className="flex flex-wrap gap-2">
              {levels.map((level: string) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? "default" : "ghost"}
                  onClick={() => setSelectedLevel(level)}
                  className="text-sm px-4 py-1 rounded-full"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={() => { fetchBooks(); setIsOpen(false); }} className="w-full">
            Get Recommendations
          </Button>
        </div>
      )}
    </div>
  );
};

const BooksPage = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("B1");

  const booksPerPage = 10;

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("https://book-api-dh5c.onrender.com/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genres: selectedGenres, levels: [selectedLevel] }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const json = await res.json();
      if (json.success) {
        setBooks(json.data);
        setCurrentPage(1);
      } else {
        setError("Failed to load books.");
      }
    } catch (err: any) {
      setError("An error occurred while fetching books.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(books.length / booksPerPage);
  const paginatedBooks = books.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = (total: number, current: number) => {
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 4) pages.push("...");
      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        pages.push(i);
      }
      if (current < total - 3) pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  const paginationPages = getPageNumbers(totalPages, currentPage);

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Recommended Books</h1>

      <FilterPopover
        genres={allGenres}
        levels={levels}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        fetchBooks={fetchBooks}
      />

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
              <div className="flex flex-col h-full bg-white shadow rounded-xl overflow-hidden hover:shadow-md transition duration-300">
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

      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center mt-10 flex-wrap gap-2 items-center">
          <Button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
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
              <span key={idx} className="px-2 text-gray-500 font-semibold select-none">...</span>
            )
          )}

          <Button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default BooksPage;
