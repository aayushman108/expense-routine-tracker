"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiPlus,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { FiUsers, FiClock } from "react-icons/fi";
import { Group } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyGroupsAction } from "@/store/slices/groupSlice";
import { fetchUserSummary } from "@/store/slices/expenseSlice";
import Button from "@/components/ui/Button/Button";
import CreateGroupModal from "@/components/dashboard/GroupModals/CreateGroupModal";
import AddExpenseModal from "@/components/dashboard/ExpenseForm/AddExpenseModal";
import SectionHeader from "@/components/ui/SectionHeader/SectionHeader";
import MonthlyExpenditureChart from "@/components/dashboard/Charts/MonthlyExpenditureChart";
import styles from "./dashboard.module.scss";
import type { RootState } from "@/store";
import { EXPENSE_TYPE } from "@expense-tracker/shared";
import { handleThunk } from "@/lib/utils";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { groups, isLoading: groupsLoading } = useAppSelector(
    (s: RootState) => s.groups,
  );
  const { summary } = useAppSelector((s: RootState) => s.expenses);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyGroupsAction());
    handleThunk(dispatch(fetchUserSummary()));
  }, [dispatch]);

  const totalSpent = summary?.lifetimeSpend || 0;
  const owedToYou = summary?.remainingToReceive || 0;
  const youOwe = summary?.remainingToPay || 0;
  const currentMonthTotal = summary?.currentMonthSpend || 0;
  const netBalance = owedToYou - youOwe;

  const stats = [
    {
      label: "Total Asset Flow",
      value: `रू ${totalSpent.toLocaleString()}`,
      trend: "+12.4%",
      icon: <HiOutlineCurrencyDollar />,
      color: "blue",
    },
    {
      label: "Operational Groups",
      value: groups?.totalGroups || 0,
      trend: "Stable",
      icon: <HiOutlineUserGroup />,
      color: "green",
    },
    {
      label: "Accounts Receivable",
      value: `रू ${owedToYou.toLocaleString()}`,
      trend: "+रू 2.1k",
      icon: <HiOutlineTrendingUp />,
      color: "yellow",
    },
    {
      label: "Accounts Payable",
      value: `रू ${youOwe.toLocaleString()}`,
      trend: "-रू 1.2k",
      icon: <HiOutlineTrendingDown />,
      color: "red",
    },
  ];

  return (
    <div className={styles.dashboard}>
      {/* ── Infrastructure Stats ── */}
      <section className={styles.stats}>
        {stats.map((stat, idx) => (
          <div key={idx} className={`${styles.statCard} ${styles[stat.color]}`}>
            <div className={styles.statGlow}></div>
            <div className={styles.statHeader}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>{stat.value}</span>
              </div>
              <div className={styles.iconWrapper}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Primary Assets ── */}
      <section className={styles.personalOverview}>
        <div
          className={styles.personalCard}
          onClick={() => setIsExpenseModalOpen(true)}
        >
          <div className={styles.cardGlow}></div>
          <div className={styles.personalContent}>
            <div className={styles.cardHeader}>
              <p>SECURE_PERSONAL_SESSION</p>
              <h2>Private Ledger</h2>
            </div>

            <div className={styles.mainStats}>
              <div className={styles.mainStat}>
                <span className={styles.mainStatLabel}>30D_CYCLE_SPEND</span>
                <div className={styles.mainStatValue}>
                  <h3>रू {currentMonthTotal.toLocaleString()}</h3>
                  <span className={styles.labelIndicator}>Current</span>
                </div>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.mainStat}>
                <span className={styles.mainStatLabel}>AGGREGATE_ASSETS</span>
                <div className={styles.mainStatValue}>
                  <h3>रू {totalSpent.toLocaleString()}</h3>
                  <span className={styles.labelIndicator}>Lifetime</span>
                </div>
              </div>
            </div>

            <div className={styles.btnRow}>
              <Button
                variant="primary"
                size="md"
                className={styles.quickEntryBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpenseModalOpen(true);
                }}
              >
                <HiPlus /> Quick Entry
              </Button>
              <Link
                href="/dashboard/personal"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="outline"
                  size="md"
                  className={styles.ledgerBtn}
                >
                  Full Ledger Analysis
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className={styles.healthCard}>
          <div className={styles.healthHeader}>
            <div className={styles.healthTitleContainer}>
              <h3>Financial Health</h3>
              <div className={styles.pulse}></div>
            </div>
            <p>Liquidity position across all settlement channels.</p>
          </div>

          <div className={styles.healthMain}>
            <div className={styles.legendItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={styles.legendDot} style={{ background: 'var(--color-success)' }}></span>
                <span className={styles.legendLabel}>Receivable</span>
              </div>
              <span className={styles.legendValueSuccess}>रू {owedToYou.toLocaleString()}</span>
            </div>

            <div className={styles.pieContainer}>
              <div 
                className={styles.pieChart}
                style={{
                  background: (owedToYou === 0 && youOwe === 0) 
                    ? 'var(--bg-tertiary)' 
                    : `conic-gradient(var(--color-success) 0% ${(owedToYou / (owedToYou + youOwe)) * 100}%, var(--color-danger) ${(owedToYou / (owedToYou + youOwe)) * 100}% 100%)`
                }}
              >
                <div className={styles.pieInner}>
                  <div className={`${styles.netLiquidityPill} ${netBalance >= 0 ? styles.positiveStatus : styles.negativeStatus}`}>
                    {netBalance >= 0 ? "+" : "-"}रू {Math.abs(netBalance).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.legendItem} ${styles.legendItemRight}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className={styles.legendDot} style={{ background: 'var(--color-danger)' }}></span>
                <span className={styles.legendLabel}>Payable</span>
              </div>
              <span className={styles.legendValueDanger}>रू {youOwe.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Transaction Intelligence ── */}
      <section className={styles.chartSection}>
        <MonthlyExpenditureChart />
      </section>

      {/* ── Operational Groups ── */}
      <section className={styles.groupSection}>
        <SectionHeader title="Operational Groups" align="between" fullWidth>
          <div className={styles.sectionActions}>
            <Link href="/dashboard/groups">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsGroupModalOpen(true)}
            >
              <HiPlus /> Create Group
            </Button>
          </div>
        </SectionHeader>

        {groupsLoading ? (
          <div className={styles.groupGrid}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <div className={styles.groupGrid}>
            {groups?.data?.map((group: Group) => (
              <Link
                key={group.id}
                href={`/dashboard/groups/${group.id}`}
                className={styles.groupItem}
              >
                <div className={styles.groupBanner}>
                  {group.image?.url ? (
                    <Image src={group.image.url} alt={group.name} fill />
                  ) : (
                    <HiOutlineOfficeBuilding />
                  )}
                </div>
                <div className={styles.groupBody}>
                  <div className={styles.groupTop}>
                    <div className={styles.groupTitle}>
                      <h4>{group.name}</h4>
                    </div>
                    <span className={styles.activeBadge}>Operational</span>
                  </div>
                  <div className={styles.groupMeta}>
                    <span>
                      <FiUsers /> {group.member_count || 1} Members
                    </span>
                    <span>
                      <FiClock /> Active
                    </span>
                  </div>
                </div>
                <div className={styles.groupFooter}>
                  <span>PROTOCOL_ID: {group.id.slice(-8)}</span>
                  <span>SETTLE_READY</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <CreateGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        expenseType={EXPENSE_TYPE.PERSONAL}
      />
    </div>
  );
}
