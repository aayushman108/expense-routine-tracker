import React from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import styles from "./TablePagination.module.scss";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalResults?: number;
  pageSize?: number;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalResults,
  pageSize = 10,
}) => {
  if (totalPages <= 1 && !totalResults) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const startResult = (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalResults || 0);

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        Showing <span>{startResult}</span> to <span>{endResult}</span> of{" "}
        <span>{totalResults}</span> results
      </div>

      <div className={styles.controls}>
        <button
          className={styles.navBtn}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <HiOutlineChevronLeft />
          <span>Previous</span>
        </button>

        <div className={styles.pages}>
          {getPageNumbers().map((page, i) => (
            <button
              key={i}
              className={`${styles.pageBtn} ${currentPage === page ? styles.active : ""} ${page === "..." ? styles.ellipsis : ""}`}
              onClick={() => typeof page === "number" && onPageChange(page)}
              disabled={page === "..."}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          className={styles.navBtn}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <span>Next</span>
          <HiOutlineChevronRight />
        </button>
      </div>
    </div>
  );
};

export default TablePagination;
