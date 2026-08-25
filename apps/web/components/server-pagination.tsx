"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface ServerPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemName?: string;
  pageParamKey?: string;
  onPageChange?: (page: number) => void;
  scrollToTop?: boolean;
}

export function ServerPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemName = "data",
  pageParamKey = "page",
  onPageChange,
  scrollToTop = true,
}: ServerPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1 && totalItems <= pageSize) {
    return null;
  }

  const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(
      searchParams ? searchParams.toString() : "",
    );
    if (page <= 1) {
      params.delete(pageParamKey);
    } else {
      params.set(pageParamKey, page.toString());
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const handlePageClick = (page: number, e: React.MouseEvent) => {
    if (page < 1 || page > totalPages || page === safeCurrentPage) {
      e.preventDefault();
      return;
    }

    if (onPageChange) {
      e.preventDefault();
      onPageChange(page);
    } else {
      e.preventDefault();
      router.push(createPageUrl(page));
    }

    if (scrollToTop && typeof window !== "undefined") {
      window.scrollTo({ top: 380, behavior: "smooth" });
    }
  };

  // Generate page numbers with ellipses
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <nav
      className="stories-pagination-bar"
      role="navigation"
      aria-label="Pagination Navigation"
    >
      <div className="pagination-info">
        <span>
          Menampilkan{" "}
          <strong>
            {startItem} - {endItem}
          </strong>{" "}
          dari <strong>{totalItems}</strong> {itemName}
        </span>
      </div>

      <div className="pagination-controls">
        {/* First Page Button */}
        {totalPages > 4 && (
          <Link
            href={createPageUrl(1)}
            onClick={(e) => handlePageClick(1, e)}
            className={`page-nav-btn icon-only ${safeCurrentPage === 1 ? "disabled" : ""}`}
            aria-label="Ke Halaman Pertama"
            aria-disabled={safeCurrentPage === 1}
            tabIndex={safeCurrentPage === 1 ? -1 : 0}
          >
            <ChevronsLeft size={15} />
          </Link>
        )}

        {/* Previous Button */}
        <Link
          href={createPageUrl(safeCurrentPage - 1)}
          onClick={(e) => handlePageClick(safeCurrentPage - 1, e)}
          className={`page-nav-btn ${safeCurrentPage === 1 ? "disabled" : ""}`}
          aria-label="Halaman Sebelumnya"
          aria-disabled={safeCurrentPage === 1}
          tabIndex={safeCurrentPage === 1 ? -1 : 0}
        >
          <ChevronLeft size={15} />
          <span className="nav-btn-text">Sebelumnya</span>
        </Link>

        {/* Page Numbers Group */}
        <div className="page-numbers-group">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`dots-${idx}`} className="page-num-ellipsis">
                  &hellip;
                </span>
              );
            }

            const isActive = p === safeCurrentPage;
            return (
              <Link
                key={p}
                href={createPageUrl(p)}
                onClick={(e) => handlePageClick(p, e)}
                className={`page-num-btn ${isActive ? "active" : ""}`}
                aria-label={`Halaman ${p}`}
                aria-current={isActive ? "page" : undefined}
              >
                {p}
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        <Link
          href={createPageUrl(safeCurrentPage + 1)}
          onClick={(e) => handlePageClick(safeCurrentPage + 1, e)}
          className={`page-nav-btn ${safeCurrentPage === totalPages ? "disabled" : ""}`}
          aria-label="Halaman Berikutnya"
          aria-disabled={safeCurrentPage === totalPages}
          tabIndex={safeCurrentPage === totalPages ? -1 : 0}
        >
          <span className="nav-btn-text">Berikutnya</span>
          <ChevronRight size={15} />
        </Link>

        {/* Last Page Button */}
        {totalPages > 4 && (
          <Link
            href={createPageUrl(totalPages)}
            onClick={(e) => handlePageClick(totalPages, e)}
            className={`page-nav-btn icon-only ${safeCurrentPage === totalPages ? "disabled" : ""}`}
            aria-label="Ke Halaman Terakhir"
            aria-disabled={safeCurrentPage === totalPages}
            tabIndex={safeCurrentPage === totalPages ? -1 : 0}
          >
            <ChevronsRight size={15} />
          </Link>
        )}
      </div>
    </nav>
  );
}
