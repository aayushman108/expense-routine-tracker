import React, { useState } from "react";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import { HiOutlineCalendar } from "react-icons/hi";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import styles from "./DownloadStatementModal.module.scss";
import { REPORT_TYPE } from "@expense-tracker/shared";

interface DownloadStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: REPORT_TYPE, startDate: string, endDate: string) => void;
  isDownloading?: string | null;
}

const DownloadStatementModal: React.FC<DownloadStatementModalProps> = ({
  isOpen,
  onClose,
  onDownload,
  isDownloading,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFullReport, setIsFullReport] = useState(false);

  const handleDownload = (format: REPORT_TYPE) => {
    onDownload(
      format,
      isFullReport ? "" : startDate,
      isFullReport ? "" : endDate,
    );
  };

  const handleClose = () => {
    if (!isDownloading) {
      setStartDate("");
      setEndDate("");
      setIsFullReport(false);
      onClose();
    }
  };

  const handleFullReportToggle = () => {
    setIsFullReport((prev) => !prev);
    if (!isFullReport) {
      setStartDate("");
      setEndDate("");
    }
  };

  const canDownload = isFullReport || (startDate && endDate);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Download Statement"
      size="md"
      footer={
        <div className={styles.footerActions}>
          <Button
            size="md"
            variant="outline"
            onClick={() => handleDownload(REPORT_TYPE.PDF)}
            isLoading={isDownloading === REPORT_TYPE.PDF}
            disabled={!!isDownloading || !canDownload}
            className={styles.pdfButton}
          >
            <FaFilePdf size={16} />
            <span>Download PDF</span>
          </Button>
          <Button
            size="md"
            variant="outline"
            onClick={() => handleDownload(REPORT_TYPE.XLSX)}
            isLoading={isDownloading === REPORT_TYPE.XLSX}
            disabled={!!isDownloading || !canDownload}
            className={styles.xlsButton}
          >
            <FaFileExcel size={16} />
            <span>Download Excel</span>
          </Button>
        </div>
      }
    >
      <div className={styles.content}>
        <p className={styles.description}>
          Select a date range for your expense statement, or download the full
          report.
        </p>

        <div className={styles.optionGroup}>
          <label
            className={styles.checkboxLabel}
            onClick={handleFullReportToggle}
          >
            <span
              className={`${styles.checkbox} ${isFullReport ? styles.checked : ""}`}
            >
              {isFullReport && (
                <svg
                  viewBox="0 0 12 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5L4.5 8.5L11 1.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className={styles.checkboxText}>
              Full Report (all expenses)
            </span>
          </label>
        </div>

        <div className={styles.dividerRow}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or select date range</span>
          <span className={styles.dividerLine} />
        </div>

        <div
          className={`${styles.dateFields} ${isFullReport ? styles.disabled : ""}`}
        >
          <div className={styles.inputWrapper}>
            <label>Start Date</label>
            <div className={styles.dateInput}>
              <HiOutlineCalendar />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isFullReport}
              />
            </div>
          </div>
          <div className={styles.inputWrapper}>
            <label>End Date</label>
            <div className={styles.dateInput}>
              <HiOutlineCalendar />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isFullReport}
                min={startDate}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DownloadStatementModal;
