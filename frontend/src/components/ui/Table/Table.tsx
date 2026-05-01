import React from "react";
import styles from "./Table.module.scss";
import TablePagination from "./TablePagination";
import Skeleton from "../Skeleton/Skeleton";

export interface Column<T> {
  header: string;
  key: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (item: T) => React.ReactNode;
  loading?: boolean;
  onPageChange?: (page: number) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    pageSize: number;
  };
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

function Table<T extends { id: string | number }>({
  data,
  columns,
  actions,
  loading,
  onPageChange,
  pagination,
  emptyMessage = "No data available",
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.skeletonTable}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height="40px" width="100%" borderRadius="4px" className={styles.skeletonRow} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
              {actions && <th className={styles.actionsCol}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => (
                <tr 
                  key={item.id} 
                  onClick={() => onRowClick?.(item)}
                  className={onRowClick ? styles.clickableRow : ""}
                >
                  {columns.map((col, idx) => (
                    <td key={idx}>
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className={styles.actionsCol} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.actionCell}>
                        {actions(item)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className={styles.emptyCell}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {pagination && onPageChange && data.length > 0 && (
          <TablePagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
            totalResults={pagination.totalResults}
            pageSize={pagination.pageSize}
          />
        )}
      </div>
    </div>
  );
}

export default Table;
