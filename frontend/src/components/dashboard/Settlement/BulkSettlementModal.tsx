"use client";

import { useState } from "react";
import {
  HiOutlineCash,
  HiOutlineArrowRight,
  HiOutlineDuplicate,
  HiCheck,
  HiOutlineInformationCircle,
  HiOutlineCloudUpload,
  HiX,
  HiOutlineQrcode,
  HiOutlineMail,
} from "react-icons/hi";
import Modal from "@/components/ui/Modal/Modal";
import Button from "@/components/ui/Button/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  settleBulkAction,
  confirmBulkAction,
} from "@/store/slices/settlementSlice";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"wallets" | "bank">("wallets");

  if (!balance) return null;

  const currentUserId = user?.id?.toString();
  const debtorId = balance.from_user_id?.toString();
  const creditorId = balance.to_user_id?.toString();

  const isYouOwe = debtorId === currentUserId;
  const isYouReceived = creditorId === currentUserId;

  console.log("Identity Presence Check:", {
    userExists: !!user,
    userName: user?.full_name,
    userId: user?.id,
    debtorName: balance.from_user_name,
    debtorId: balance.from_user_id,
    isYouOwe,
  });

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (balance.status === SETTLEMENT_STATUS.PAID) {
        await dispatch(
          confirmBulkAction({
            groupId,
            fromUserId: balance.from_user_id,
            toUserId: balance.to_user_id,
          }),
        ).unwrap();
      } else {
        await dispatch(
          settleBulkAction({
            groupId,
            fromUserId: balance.from_user_id,
            toUserId: balance.to_user_id,
            proofImage,
          }),
        ).unwrap();
      }
      onClose();
    } catch (error) {
      console.error("Settlement action failed:", error);
    } finally {
      setIsSubmitting(false);
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

  const paymentMethods = [
    {
      id: "khalti-1",
      provider: "Khalti",
      external_id: "98XXXXXXXX",
      metadata: { qr_label: "Scan for Khalti" },
    },
    {
      id: "esewa-1",
      provider: "eSewa",
      external_id: "98XXXXXXXX",
      metadata: { qr_label: "Scan for eSewa" },
    },
    {
      id: "bank-1",
      provider: "Nabil Bank Ltd.",
      external_id: "001XXXXXXXXXXX",
      metadata: {
        bank_name: "Nabil Bank Ltd.",
        branch_name: "New Road, Kathmandu",
        account_name: balance.to_user_name,
        swift_code: "NABILNPKA",
        qr_label: "Bank QR Payment",
      },
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settle Balance" size="lg">
      <div className={styles.modalContent}>
        {/* Step 1: Participants */}
        <div className={styles.settlementFlow}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {balance.from_user_avatar?.url ? (
                <img
                  src={balance.from_user_avatar.url}
                  alt={balance.from_user_name}
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
                <img
                  src={balance.to_user_avatar.url}
                  alt={balance.to_user_name}
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
              {activeTab === "wallets" ? (
                <div className={styles.modernWallets}>
                  {paymentMethods
                    .filter((pm) => !pm.provider.toLowerCase().includes("bank"))
                    .map((pm) => {
                      const isKhalti = pm.provider
                        .toLowerCase()
                        .includes("khalti");
                      return (
                        <div
                          key={pm.id}
                          className={`${styles.modernWalletCard} ${isKhalti ? styles.khalti : styles.esewa}`}
                        >
                          <div className={styles.cardHeader}>
                            <div className={styles.providerLogo}>
                              {pm.provider}
                            </div>
                          </div>
                          <div className={styles.cardBody}>
                            <div className={styles.infoSide}>
                              <span className={styles.label}>Account ID</span>
                              <div className={styles.idRow}>
                                <span className={styles.value}>
                                  {pm.external_id}
                                </span>
                                <button
                                  className={styles.copyBtn}
                                  onClick={() =>
                                    copyToClipboard(pm.external_id, pm.id)
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
                                {balance.to_user_name}
                              </span>
                            </div>
                            <div className={styles.qrSide}>
                              <div className={styles.qrWrapper}>
                                <HiOutlineQrcode />
                                <div className={styles.qrOverlay}>SCAN</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className={styles.modernBankWrapper}>
                  {paymentMethods
                    .filter((pm) => pm.provider.toLowerCase().includes("bank"))
                    .map((pm) => (
                      <div key={pm.id} className={styles.bankCardModern}>
                        <div className={styles.infoSide}>
                          <div className={styles.bankHeader}>
                            <div className={styles.bankChip} />
                            <span className={styles.bankName}>
                              {pm.metadata?.bank_name}
                            </span>
                          </div>

                          <div className={styles.mainAccount}>
                            <span className={styles.label}>Account Number</span>
                            <div className={styles.numberRow}>
                              <span className={styles.number}>
                                {pm.external_id.replace(/(.{4})/g, "$1 ")}
                              </span>
                              <button
                                className={styles.copyBtn}
                                onClick={() =>
                                  copyToClipboard(pm.external_id, pm.id)
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
                                {pm.metadata?.account_name}
                              </span>
                            </div>
                            <div className={styles.item}>
                              <span className={styles.al}>SWIFT</span>
                              <span className={styles.av}>
                                {pm.metadata?.swift_code}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.qrSide}>
                          <div className={styles.qrWrapper}>
                            <HiOutlineQrcode />
                            <div className={styles.qrOverlay}>SCAN</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  <div className={styles.bankAuxInfo}>
                    <div className={styles.auxRow}>
                      <span>Branch</span>
                      <strong>{paymentMethods[2].metadata?.branch_name}</strong>
                    </div>
                  </div>
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
                <img
                  src={previewUrl}
                  alt="Proof"
                  className={styles.previewImage}
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
              <img
                src={balance.proof_image.url}
                alt="Proof"
                className={styles.previewImage}
              />
            </div>
          </section>
        )}

        {/* Footer Actions */}
        <div className={styles.footer}>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          {/* Action Button: Only show relevant action for the relevant user */}
          {balance.status === SETTLEMENT_STATUS.PENDING ? (
            // Pending State: Only the Debtor can settle
            isYouOwe && (
              <Button
                variant="primary"
                onClick={handleConfirm}
                isLoading={isSubmitting}
                disabled={!proofImage}
              >
                Settle Balance
              </Button>
            )
          ) : // Paid State: Creditor confirms, Debtor waits
          isYouReceived ? (
            <Button
              variant="primary"
              onClick={handleConfirm}
              isLoading={isSubmitting}
            >
              Confirm Receipt
            </Button>
          ) : (
            <Button variant="primary" disabled>
              Awaiting Verification
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
