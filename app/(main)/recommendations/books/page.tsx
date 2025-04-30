"use client";

import { useEffect, useState } from "react";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "@/app/(main)/header";
import { Button } from "@/components/ui/button";

type Book = {
  _id: string;
  "Book ID": number;
  Title: string;
  Author: string;
  "Image URL": string;
  "Book URL": string;
  Description: string;
  Age: number;
  Genres: string;
};

const allGenres = [
  "Դրամա", "Կենսագրություն", "Պոեզիա",
  "Պատմական գեղարվեստական գրականություն", "Կատակերգություն", "Ռոման", "Թրիլլեր",
  "Արժանահավատ", "Երիտասարդական", "Դետեկտիվ", "Ժամանակակից",
  "Ֆանտաստիկա", "Գիտական ֆանտաստիկա", "Արկածային", "Սիրավեպ",
  "Մանկական գրականություն"
];

const booksPerPage = 10;

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/bookrec");
        const json = await res.json();
        if (json.success) {
          setBooks(json.data);
        } else {
          setError("Failed to load books.");
        }
      } catch (err) {
        setError("An error occurred while fetching books.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  const filteredBooks = books.filter(book => {
    const bookGenres = book.Genres.split(",").map(g => g.trim());
    return selectedGenres.length === 0 || bookGenres.some(g => selectedGenres.includes(g));
  });

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  return (
    <div>
      <FeedWrapper>
        <Header title="Armenian Literature" />

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Filter by Genre</h2>
          <div className="flex flex-wrap gap-3">
            {allGenres.map(genre => (
              <label key={genre} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  value={genre}
                  checked={selectedGenres.includes(genre)}
                  onChange={() => toggleGenre(genre)}
                />
                <span>{genre}</span>
              </label>
            ))}
          </div>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="space-y-4">
              {currentBooks.map(book => (
                <div key={book._id} className="border p-4 rounded-md shadow-md">
                  <h2 className="text-xl font-semibold">{book.Title}</h2>
                  <p className="text-sm text-gray-600">by {book.Author}</p>
                  <img
                    src={book["Image URL"]}
                    alt={book.Title}
                    className="w-40 mt-2 rounded"
                  />
                  <p className="mt-2 text-sm">{book.Description}</p>
                  <a
                    href={book["Book URL"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline mt-2 block"
                  >
                    Read More
                  </a>
                  <p className="text-sm text-gray-500 mt-1">
                    Age: {book.Age} | Genres: {book.Genres}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>Page {currentPage} of {totalPages}</span>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </FeedWrapper>
    </div>
  );
};

export default BooksPage;
