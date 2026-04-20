"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  HiOutlineCash,
  HiOutlineArrowRight,
  HiOutlineDuplicate,
  HiCheck,
  HiOutlineInformationCircle,
  HiOutlineCloudUpload,
  HiX,
  HiOutlineQrcode,
} from "react-icons/hi";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  settleBulkAction,
  confirmBulkAction,
} from "@/store/slices/settlementSlice";
import { fetchTargetUserPaymentMethods } from "@/store/slices/paymentMethodSlice";
import { handleThunk } from "@/lib/utils";
import { SETTLEMENT_STATUS } from "@expense-tracker/shared";
import type { GroupBalance } from "@/lib/types";
import styles from "./BulkSettlementModal.module.scss";

interface BulkSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  balance: GroupBalance | null;
}

export default function BulkSettlementModal({
  isOpen,
  onClose,
  groupId,
  balance,
}: BulkSettlementModalProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"wallets" | "bank">("wallets");

  const [submittingAction, setSubmittingAction] = useState<
    "settle" | "confirm" | null
  >(null);
  const { isSubmitting } = useAppSelector((state) => state.settlements);

  const { paymentMethods, isLoading: isPaymentLoading } = useAppSelector(
    (state) => state.paymentMethods,
  );

  const currentUserId = user?.id?.toString();
  const debtorId = balance?.from_user_id?.toString();
  const creditorId = balance?.to_user_id?.toString();

  const isYouOwe = debtorId === currentUserId;
  const isYouReceived = creditorId === currentUserId;

  const settlementStatus = balance?.status;
  const targetUserId = balance?.to_user_id;

  const fetchPaymentInfo = useCallback(async () => {
    if (
      isOpen &&
      isYouOwe &&
      settlementStatus === SETTLEMENT_STATUS.PENDING &&
      targetUserId
    ) {
      await handleThunk(
        dispatch(fetchTargetUserPaymentMethods(targetUserId)),
        () => {},
        (error: any) => {
          console.error("Failed to fetch payment methods:", error);
        },
      );
    }
  }, [isOpen, isYouOwe, settlementStatus, targetUserId, dispatch]);

  useEffect(() => {
    fetchPaymentInfo();
  }, [fetchPaymentInfo]);

  if (!balance) return null;

  const handleConfirm = async () => {
    if (balance.status === SETTLEMENT_STATUS.PAID) {
      setSubmittingAction("confirm");
      await handleThunk(
        dispatch(
          confirmBulkAction({
            groupId,
            fromUserId: balance.from_user_id,
            toUserId: balance.to_user_id,
          }),
        ),
        () => {
          setSubmittingAction(null);
          onClose();
        },
        () => {
          setSubmittingAction(null);
        },
      );
    } else {
      setSubmittingAction("settle");
      await handleThunk(
        dispatch(
          settleBulkAction({
            groupId,
            fromUserId: balance.from_user_id,
            toUserId: balance.to_user_id,
            proofImage,
          }),
        ),
        () => {
          setSubmittingAction(null);
          onClose();
        },
        () => {
          setSubmittingAction(null);
        },
      );
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setProofImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settle Balance"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          {balance.status === SETTLEMENT_STATUS.PENDING ? (
            isYouOwe && (
              <Button
                variant="primary"
                onClick={handleConfirm}
                isLoading={submittingAction === "settle"}
                disabled={!proofImage || isSubmitting}
              >
                Settle Balance
              </Button>
            )
          ) : isYouReceived ? (
            <Button
              variant="primary"
              onClick={handleConfirm}
              isLoading={submittingAction === "confirm"}
              disabled={isSubmitting}
            >
              Confirm Receipt
            </Button>
          ) : (
            <Button variant="primary" disabled>
              Awaiting Verification
            </Button>
          )}
        </>
      }
    >
      <div className={styles.modalContent}>
        {/* Step 1: Participants */}
        <div className={styles.settlementFlow}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {balance.from_user_avatar?.url ? (
                <Image
                  src={balance.from_user_avatar.url}
                  alt={balance.from_user_name || "User"}
                  fill
                  style={{ objectFit: "cover" }}
                />
              ) : (
                getInitials(balance.from_user_name)
              )}
            </div>
            <div className={styles.nameContainer}>
              <span className={styles.name}>
                {isYouOwe ? "You" : balance.from_user_name}
                {isYouOwe && <span className={styles.meBadge}>(ME)</span>}
              </span>
            </div>
            <span className={styles.role}>Debtor</span>
          </div>

          <div className={styles.connector}>
            <div className={styles.amountBadge}>
              <HiOutlineCash />
              <span>रू {Number(balance.total_amount).toLocaleString()}</span>
            </div>
            <div className={styles.arrowWrapper}>
              <HiOutlineArrowRight />
            </div>
          </div>

          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {balance.to_user_avatar?.url ? (
                <Image
                  src={balance.to_user_avatar.url}
                  alt={balance.to_user_name || "User"}
                  fill
                  style={{ objectFit: "cover" }}
                />
              ) : (
                getInitials(balance.to_user_name)
              )}
            </div>
            <div className={styles.nameContainer}>
              <span className={styles.name}>
                {isYouReceived ? "You" : balance.to_user_name}
                {isYouReceived && <span className={styles.meBadge}>(ME)</span>}
              </span>
            </div>
            <span className={styles.role}>Creditor</span>
          </div>
        </div>

        {/* Step 2: Guidance Box */}
        <div className={styles.guidanceBox}>
          {balance.status === SETTLEMENT_STATUS.PAID ? (
            <div className={styles.verificationFlow}>
              <span className={styles.iconWrapper}>
                <HiCheck />
              </span>
              <div className={styles.textWrap}>
                <h4>Verification Pending</h4>
                <p>
                  {isYouReceived
                    ? `Please review the receipt below and confirm if you've received the payment.`
                    : `${balance.from_user_name} has reported payment. Awaiting creditor's verification.`}
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.paymentFlow}>
              <span className={styles.iconWrapper}>
                <HiOutlineInformationCircle />
              </span>
              <div className={styles.textWrap}>
                <h4>Payment Instructions</h4>
                <p>
                  {isYouOwe
                    ? `Please pay via the account below and upload a screenshot of the transaction.`
                    : `Please wait for ${balance.from_user_name} (${balance.from_user_email}) to pay and upload proof.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Payment Details (Only for Debtor paying) */}
        {isYouOwe && balance.status === SETTLEMENT_STATUS.PENDING && (
          <section className={styles.paymentSection}>
            <div className={styles.sectionHeader}>
              <h3>
                Pay to {balance.to_user_name} ({balance.to_user_email})
              </h3>
            </div>

            <div className={styles.tabs}>
              <div
                className={`${styles.tab} ${activeTab === "wallets" ? styles.active : ""}`}
                onClick={() => setActiveTab("wallets")}
              >
                Wallets
              </div>
              <div
                className={`${styles.tab} ${activeTab === "bank" ? styles.active : ""}`}
                onClick={() => setActiveTab("bank")}
              >
                Bank Account
              </div>
            </div>

            <div className={styles.tabContent}>
              {isPaymentLoading ? (
                <div className={styles.pmLoader}>
                  <div className={styles.spinner} />
                  <span>Fetching payment accounts...</span>
                </div>
              ) : activeTab === "wallets" ? (
                <div className={styles.modernWallets}>
                  {paymentMethods
                    .filter((pm) => !pm.provider.toLowerCase().includes("bank"))
                    .map((pm) => {
                      const isKhalti = pm.provider
                        .toLowerCase()
                        .includes("khalti");
                      const meta = (pm.metadata || {}) as Record<
                        string,
                        string
                      >;
                      const accountId = meta.phone || meta.account_id || "N/A";
                      return (
                        <div
                          key={pm.id}
                          className={`${styles.modernWalletCard} ${isKhalti ? styles.khalti : styles.esewa}`}
                        >
                          <div className={styles.cardHeader}>
                            <div className={styles.providerLogo}>
                              {pm.provider.toUpperCase()}
                            </div>
                          </div>
                          <div className={styles.cardBody}>
                            <div className={styles.infoSide}>
                              <span className={styles.label}>
                                Account / Phone
                              </span>
                              <div className={styles.idRow}>
                                <span className={styles.value}>
                                  {accountId}
                                </span>
                                <button
                                  className={styles.copyBtn}
                                  onClick={() =>
                                    copyToClipboard(accountId, pm.id)
                                  }
                                >
                                  {copiedId === pm.id ? (
                                    <HiCheck />
                                  ) : (
                                    <HiOutlineDuplicate />
                                  )}
                                </button>
                              </div>
                              <span className={styles.name}>
                                {meta.name || balance.to_user_name}
                              </span>
                            </div>
                            <div className={styles.qrSide}>
                              <div className={styles.qrWrapper}>
                                {meta.qrCode ? (
                                  <Image
                                    src={meta.qrCode}
                                    alt="QR Code"
                                    fill
                                    unoptimized
                                    style={{ objectFit: "contain" }}
                                  />
                                ) : (
                                  <HiOutlineQrcode />
                                )}
                                <div className={styles.qrOverlay}>SCAN</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {paymentMethods.filter(
                    (pm) => !pm.provider.toLowerCase().includes("bank"),
                  ).length === 0 && (
                    <div className={styles.noInfo}>
                      <HiOutlineInformationCircle />
                      <p>No wallet details shared by {balance.to_user_name}.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.modernBankWrapper}>
                  {paymentMethods
                    .filter((pm) => pm.provider.toLowerCase().includes("bank"))
                    .map((pm) => {
                      const meta = (pm.metadata || {}) as Record<
                        string,
                        string
                      >;
                      const accNumber = meta.accountNumber || "N/A";
                      return (
                        <div key={pm.id} className={styles.bankCardModern}>
                          <div className={styles.infoSide}>
                            <div className={styles.bankHeader}>
                              <div className={styles.bankChip} />
                              <span className={styles.bankName}>
                                {meta.bankName || "Bank Account"}
                              </span>
                            </div>

                            <div className={styles.mainAccount}>
                              <span className={styles.label}>
                                Account Number
                              </span>
                              <div className={styles.numberRow}>
                                <span className={styles.number}>
                                  {accNumber.replace(/(.{4})/g, "$1 ")}
                                </span>
                                <button
                                  className={styles.copyBtn}
                                  onClick={() =>
                                    copyToClipboard(accNumber, pm.id)
                                  }
                                >
                                  {copiedId === pm.id ? (
                                    <HiCheck />
                                  ) : (
                                    <HiOutlineDuplicate />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className={styles.auxInfo}>
                              <div className={styles.item}>
                                <span className={styles.al}>HOLDER</span>
                                <span className={styles.av}>
                                  {meta.accountHolder ||
                                    meta.name ||
                                    balance.to_user_name}
                                </span>
                              </div>
                              <div className={styles.item}>
                                <span className={styles.al}>BRANCH</span>
                                <span className={styles.av}>
                                  {meta.branchName || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className={styles.qrSide}>
                            <div className={styles.qrWrapper}>
                              {meta.qrCode ? (
                                <Image
                                  src={meta.qrCode}
                                  alt="QR Code"
                                  fill
                                  unoptimized
                                  style={{ objectFit: "contain" }}
                                />
                              ) : (
                                <HiOutlineQrcode />
                              )}
                              <div className={styles.qrOverlay}>SCAN</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {paymentMethods.filter((pm) =>
                    pm.provider.toLowerCase().includes("bank"),
                  ).length === 0 && (
                    <div className={styles.noInfo}>
                      <HiOutlineInformationCircle />
                      <p>No bank details shared by {balance.to_user_name}.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {!isYouOwe && balance.status === SETTLEMENT_STATUS.PENDING && (
          <div className={styles.infoBox}>
            <p>
              Only{" "}
              <strong>
                {balance.from_user_name} ({balance.from_user_email})
              </strong>{" "}
              can upload payment proof.
            </p>
          </div>
        )}

        {/* Step 4: Upload/Proof Area */}
        {isYouOwe && balance.status === SETTLEMENT_STATUS.PENDING && (
          <section className={styles.uploadSection}>
            <div className={styles.sectionHeader}>
              <h3>Upload Receipt</h3>
            </div>
            {!previewUrl ? (
              <label className={styles.uploadLabel}>
                <input
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handleFileChange}
                />
                <div className={styles.uploadPlaceholder}>
                  <HiOutlineCloudUpload />
                  <div className={styles.textContainer}>
                    <p className={styles.mainText}>Click to upload proof</p>
                    <p className={styles.subText}>PNG, JPG (max. 5MB)</p>
                  </div>
                </div>
              </label>
            ) : (
              <div className={styles.previewContainer}>
                <Image
                  src={previewUrl}
                  alt="Proof"
                  fill
                  unoptimized
                  className={styles.previewImage}
                  style={{ objectFit: "contain" }}
                />
                <button className={styles.removeBtn} onClick={removeImage}>
                  <HiX />
                </button>
              </div>
            )}
          </section>
        )}

        {balance.status === SETTLEMENT_STATUS.PAID && balance.proof_image && (
          <section className={styles.uploadSection}>
            <div className={styles.sectionHeader}>
              <h3>View Proof</h3>
            </div>
            <div className={styles.previewContainer}>
              <Image
                src={
                  typeof balance.proof_image === "string"
                    ? JSON.parse(balance.proof_image).url
                    : balance.proof_image.url
                }
                alt="Proof"
                fill
                unoptimized
                className={styles.previewImage}
                style={{ objectFit: "contain" }}
              />
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
}
