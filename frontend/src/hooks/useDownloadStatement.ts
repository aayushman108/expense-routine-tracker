import { useState } from "react";
import api from "@/lib/api";
import { EXPENSE_TYPE, REPORT_TYPE } from "@expense-tracker/shared";

interface UseDownloadStatementProps {
  groupId?: string;
  expenseType?: EXPENSE_TYPE;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useDownloadStatement = ({
  groupId,
  expenseType,
  onSuccess,
  onError,
}: UseDownloadStatementProps = {}) => {
  const [downloadingFormat, setDownloadingFormat] =
    useState<REPORT_TYPE | null>(null);

  const handleDownloadStatement = async (
    format: REPORT_TYPE,
    startDate: string,
    endDate: string,
  ) => {
    setDownloadingFormat(format);
    try {
      const params = new URLSearchParams();
      if (groupId) params.append("groupId", groupId);
      if (expenseType) params.append("expenseType", expenseType);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("format", format);

      const response = await api.get(
        `/expenses/user/download-statement?${params.toString()}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${groupId ? "group" : "personal"}_expense_statement_${Date.now()}.${format}`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      onError?.(
        error?.response?.data?.message || "Failed to download statement",
      );
    } finally {
      setDownloadingFormat(null);
    }
  };

  return {
    handleDownloadStatement,
    downloadingFormat,
    isDownloading: !!downloadingFormat,
  };
};
