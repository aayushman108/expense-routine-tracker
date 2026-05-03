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
  updateSettlementStatusAction,
  updateSettlementProofAction,
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
// Helper to extract proof URL from balance
const getInitialProofUrl = (b: GroupBalance | null) => {
  if (!b?.proof_image) return null;
  return typeof b.proof_image === "string"
    ? JSON.parse(b.proof_image).url
    : b.proof_image.url;
};

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

  // Initialize state from balance prop
  const [previewUrl, setPreviewUrl] = useState<string | null>(() =>
    getInitialProofUrl(balance),
  );

  const [activeTab, setActiveTab] = useState<"wallets" | "bank">("wallets");

  const [submittingAction, setSubmittingAction] = useState<
    "settle" | "confirm" | "reject" | "update" | null
  >(null);
  const { isSubmitting } = useAppSelector((state) => state.settlements);

  const { paymentMethods, isLoading: isPaymentLoading } = useAppSelector(
    (state) => state.paymentMethods,
  );

  const currentUserId = user?.id?.toString();
  const debtorId = balance?.from_user_id?.toString();
  const creditorId = balance?.to_user_id?.toString();

  const isFromUser = debtorId === currentUserId;
  const isToUser = creditorId === currentUserId;

  const targetUserId = balance?.to_user_id;

  const fetchPaymentInfo = useCallback(async () => {
    if (isOpen && isFromUser && targetUserId) {
      await handleThunk(
        dispatch(fetchTargetUserPaymentMethods(targetUserId)),
        () => {},
        (error: string) => {
          console.error("Failed to fetch payment methods:", error);
        },
      );
    }
  }, [isOpen, isFromUser, targetUserId, dispatch]);

  useEffect(() => {
    fetchPaymentInfo();
  }, [fetchPaymentInfo]);

  if (!balance) return null;

  // Handle initial settlement (PENDING -> PAID)
  const handleSettle = async () => {
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
  };

  // Handle confirming a paid settlement (PAID -> CONFIRMED)
  const handleConfirm = async () => {
    if (!balance.settlement_id) return;
    setSubmittingAction("confirm");
    await handleThunk(
      dispatch(
        updateSettlementStatusAction({
          settlementId: balance.settlement_id,
          groupId,
          status: SETTLEMENT_STATUS.CONFIRMED,
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
  };

  // Handle rejecting a settlement (PAID -> REJECTED)
  const handleReject = async () => {
    if (!balance.settlement_id) return;
    setSubmittingAction("reject");
    await handleThunk(
      dispatch(
        updateSettlementStatusAction({
          settlementId: balance.settlement_id,
          groupId,
          status: SETTLEMENT_STATUS.REJECTED,
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
  };

  // Handle re-uploading proof (PAID/REJECTED -> update proof, set status to PAID)
  const handleUpdateProof = async () => {
    if (!balance.settlement_id || !proofImage) return;
    setSubmittingAction("update");
    await handleThunk(
      dispatch(
        updateSettlementProofAction({
          settlementId: balance.settlement_id,
          groupId,
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
      disableClose={isSubmitting}
      title="Settle Balance"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          {/* PENDING Status */}
          {balance.status === SETTLEMENT_STATUS.PENDING && isFromUser && (
            <Button
              variant="primary"
              onClick={handleSettle}
              isLoading={submittingAction === "settle"}
              disabled={!proofImage || isSubmitting}
            >
              Settle Balance
            </Button>
          )}

          {/* PAID Status */}
          {balance.status === SETTLEMENT_STATUS.PAID && (
            <>
              {isFromUser && (
                <Button
                  variant="primary"
                  onClick={handleUpdateProof}
                  isLoading={submittingAction === "update"}
                  disabled={!proofImage || isSubmitting}
                >
                  Update Payment Info
                </Button>
              )}
              {isToUser && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    variant="danger"
                    onClick={handleReject}
                    isLoading={submittingAction === "reject"}
                    disabled={isSubmitting}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleConfirm}
                    isLoading={submittingAction === "confirm"}
                    disabled={isSubmitting}
                  >
                    Confirm Receipt
                  </Button>
                </div>
              )}
              {!isFromUser && !isToUser && (
                <Button variant="primary" disabled>
                  Awaiting Verification
                </Button>
              )}
            </>
          )}

          {/* REJECTED Status */}
          {balance.status === SETTLEMENT_STATUS.REJECTED && isFromUser && (
            <Button
              variant="primary"
              onClick={handleUpdateProof}
              isLoading={submittingAction === "update"}
              disabled={!proofImage || isSubmitting}
            >
              Update Payment Info
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
                {isFromUser ? "You" : balance.from_user_name}
                {isFromUser && <span className={styles.meBadge}>(ME)</span>}
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
                {isToUser ? "You" : balance.to_user_name}
                {isToUser && <span className={styles.meBadge}>(ME)</span>}
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
                  {isToUser
                    ? `Please review the receipt below and confirm if you've received the payment.`
                    : isFromUser
                      ? `You have reported payment. You can update the proof if needed.`
                      : `${balance.from_user_name} has reported payment. Awaiting creditor's verification.`}
                </p>
              </div>
            </div>
          ) : balance.status === SETTLEMENT_STATUS.REJECTED ? (
            <div className={styles.rejectionFlow}>
              <span className={`${styles.iconWrapper} ${styles.rejected}`}>
                <HiX />
              </span>
              <div className={styles.textWrap}>
                <h4>Payment Rejected</h4>
                <p>
                  {isFromUser
                    ? `Your payment proof was rejected. Please upload a valid proof of payment.`
                    : `You have rejected this payment. Awaiting ${balance.from_user_name} to re-upload proof.`}
                </p>
              </div>
            </div>
          ) : balance.status === SETTLEMENT_STATUS.CONFIRMED ? (
            <div className={styles.verificationFlow}>
              <span className={styles.iconWrapper}>
                <HiCheck />
              </span>
              <div className={styles.textWrap}>
                <h4>Settlement Confirmed</h4>
                <p>
                  {isToUser
                    ? `You have confirmed receiving the payment from ${balance.from_user_name}.`
                    : isFromUser
                      ? `Your payment has been confirmed by ${balance.to_user_name}.`
                      : `This settlement between ${balance.from_user_name} and ${balance.to_user_name} has been confirmed.`}
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
                  {isFromUser
                    ? `Please pay via the account below and upload a screenshot of the transaction.`
                    : `Please wait for ${balance.from_user_name} (${balance.from_user_email}) to pay and upload proof.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Payment Details (Only for Debtor paying) */}
        {isFromUser &&
          (balance.status === SETTLEMENT_STATUS.PENDING ||
            balance.status === SETTLEMENT_STATUS.REJECTED) && (
            <section className={styles.paymentSection}>
              {/* ... existing payment section code ... */}
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
                      .filter(
                        (pm) => !pm.provider.toLowerCase().includes("bank"),
                      )
                      .map((pm) => {
                        const isKhalti = pm.provider
                          .toLowerCase()
                          .includes("khalti");
                        const meta = (pm.metadata || {}) as Record<
                          string,
                          string
                        >;
                        const accountId =
                          meta.phone || meta.account_id || "N/A";
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
                        <p>
                          No wallet details shared by {balance.to_user_name}.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.modernBankWrapper}>
                    {paymentMethods
                      .filter((pm) =>
                        pm.provider.toLowerCase().includes("bank"),
                      )
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

        {!isFromUser && balance.status === SETTLEMENT_STATUS.PENDING && (
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
        {isFromUser &&
          (balance.status === SETTLEMENT_STATUS.PENDING ||
            balance.status === SETTLEMENT_STATUS.PAID ||
            balance.status === SETTLEMENT_STATUS.REJECTED) && (
            <section className={styles.uploadSection}>
              <div className={styles.sectionHeader}>
                <h3>{previewUrl ? "Selected Proof" : "Upload Receipt"}</h3>
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

        {(balance.status === SETTLEMENT_STATUS.PAID ||
          balance.status === SETTLEMENT_STATUS.CONFIRMED ||
          balance.status === SETTLEMENT_STATUS.REJECTED) &&
          balance.proof_image &&
          (balance.status === SETTLEMENT_STATUS.CONFIRMED || !isFromUser) && (
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
