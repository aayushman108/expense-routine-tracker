import Select from "@/components/ui/Select/Select";
import styles from "./PaymentDetailsForm.module.scss";
import Image from "next/image";

import { HiOutlineQrcode, HiOutlineX } from "react-icons/hi";
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import { PROVIDER_OPTIONS } from "@/constants";
import { useEffect, useState } from "react";
import { PAYMENT_METHOD_TYPE } from "@expense-tracker/shared/enum/payment.enum";
import {
  createPaymentMethod,
  updatePaymentMethod,
} from "@/store/slices/paymentMethodSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToast } from "@/store/slices/uiSlice";
import { PaymentMethod } from "@/lib/types";
import { FORM_MODE } from "@expense-tracker/shared";
import { getMetadataFields } from "@/app/dashboard/profile/page";
import { RootState } from "@/store";
import { handleThunk } from "@/lib/utils";

interface PaymentDetailsFormProps {
  pm?: PaymentMethod | null;
  mode: FORM_MODE;
  closeModal: () => void;
}
export function PaymentDetailsForm({
  pm,
  mode,
  closeModal,
}: PaymentDetailsFormProps) {
  const dispatch = useAppDispatch();
  const { isLoading: pmLoading } = useAppSelector(
    (s: RootState) => s.paymentMethods,
  );

  const [pmForm, setPmForm] = useState<{
    provider?: PAYMENT_METHOD_TYPE;
    metadata: Record<string, string>;
    isDefault: boolean;
  }>({
    provider: undefined,
    metadata: {},
    isDefault: false,
  });

  useEffect(() => {
    if (mode === FORM_MODE.EDIT && pm) {
      setPmForm({
        provider: pm?.provider,
        metadata: pm?.metadata as Record<string, string>,
        isDefault: pm?.is_default || false,
      });
    }
  }, [pm]);

  const handlePmProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPmForm((prev) => {
      const newMetadata: Record<string, string> = {};
      if (prev.metadata.qrCode) {
        newMetadata.qrCode = prev.metadata.qrCode;
      }
      return {
        ...prev,
        provider: e.target.value as PAYMENT_METHOD_TYPE,
        metadata: newMetadata,
      };
    });
  };

  const handlePmMetaChange = (key: string, value: string) => {
    setPmForm((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, [key]: value },
    }));
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        dispatch(
          addToast({
            type: "error",
            message: "Image size should be less than 2MB",
          }),
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        handlePmMetaChange("qrCode", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === FORM_MODE.EDIT && pm) {
      await handleThunk(
        dispatch(
          updatePaymentMethod({
            id: pm.id,
            provider: pmForm.provider,
            metadata: pmForm.metadata,
            isDefault: pmForm.isDefault,
          }),
        ),
        () => {
          dispatch(
            addToast({
              type: "success",
              message: "Payment method updated!",
            }),
          );
          closeModal();
        },
        () => {
          dispatch(
            addToast({
              type: "error",
              message: "Failed to update payment method.",
            }),
          );
        },
      );
    } else {
      await handleThunk(
        dispatch(
          createPaymentMethod({
            provider: pmForm.provider as PAYMENT_METHOD_TYPE,
            metadata: pmForm.metadata,
            isDefault: pmForm.isDefault,
          }),
        ),
        () => {
          dispatch(
            addToast({
              type: "success",
              message: "Payment method added!",
            }),
          );
          closeModal();
        },
        () => {
          dispatch(
            addToast({
              type: "error",
              message: "Failed to add payment method.",
            }),
          );
        },
      );
    }
  };

  function getProviderLabel(provider: string) {
    return (
      PROVIDER_OPTIONS.find((p) => p.value === provider)?.label || provider
    );
  }

  const metaFields = getMetadataFields(pmForm.provider as PAYMENT_METHOD_TYPE);

  return (
    <form onSubmit={handlePmSubmit} className={styles.pmForm}>
      <Select
        label="Provider"
        name="provider"
        value={pmForm.provider}
        onChange={handlePmProviderChange}
        options={PROVIDER_OPTIONS}
        placeholder="Select a provider"
        required
        listHeight={150}
      />

      {pmForm.provider &&
        metaFields.map((field) =>
          field.type === "file" ? (
            <div key={field.key} className={styles.qrUpload}>
              <label>{field.label}</label>
              <div className={styles.qrPreviewWrapper}>
                {pmForm.metadata.qrCode ? (
                  <div className={styles.qrPreview}>
                    <Image
                      src={pmForm.metadata.qrCode}
                      alt="QR Preview"
                      fill
                      unoptimized
                      style={{ objectFit: "contain" }}
                    />
                    <button
                      type="button"
                      className={styles.removeQr}
                      onClick={() => handlePmMetaChange("qrCode", "")}
                    >
                      <HiOutlineX />
                    </button>
                  </div>
                ) : (
                  <div className={styles.qrPlaceholder}>
                    <HiOutlineQrcode />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className={styles.fileInput}
                    />
                    <span>Click to upload QR Code</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Input
              key={field.key}
              label={field.label}
              name={field.key}
              value={pmForm.metadata[field.key] || ""}
              onChange={(e) => handlePmMetaChange(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          ),
        )}

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={pmForm.isDefault}
          onChange={(e) =>
            setPmForm((prev) => ({ ...prev, isDefault: e.target.checked }))
          }
        />
        Set as default payment method
      </label>

      <div className={styles.modalFooter}>
        <Button variant="ghost" type="button" onClick={() => closeModal()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={pmLoading} disabled={!pmForm.provider}>
          {mode === FORM_MODE.EDIT ? "Update" : "Add"} Payment Method
        </Button>
      </div>
    </form>
  );
}
