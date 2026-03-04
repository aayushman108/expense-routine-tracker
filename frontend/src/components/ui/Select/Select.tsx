"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { HiCheck, HiChevronDown } from "react-icons/hi";
import styles from "./Select.module.scss";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  listHeight?: string | number;
}

export default function Select({
  label,
  error,
  icon,
  required = false,
  name,
  className = "",
  id,
  options,
  placeholder = "Select an option",
  value,
  onChange,
  disabled = false,
  listHeight,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  // Find the selected option's label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  // When dropdown opens, highlight the selected item
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, options, value]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (onChange) {
        // Create a synthetic event to match the onChange interface
        const syntheticEvent = {
          target: { name: name || "", value: optionValue },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
      setIsOpen(false);
    },
    [onChange, name],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const opt = options[highlightedIndex];
            if (opt && !opt.disabled) handleSelect(opt.value);
          } else {
            setIsOpen(true);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) => {
              let next = prev + 1;
              while (next < options.length && options[next].disabled) next++;
              return next < options.length ? next : prev;
            });
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => {
              let next = prev - 1;
              while (next >= 0 && options[next].disabled) next--;
              return next >= 0 ? next : prev;
            });
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [disabled, isOpen, highlightedIndex, options, handleSelect],
  );

  return (
    <div className={`${styles.selectGroup} ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.selectContainer}>
        {/* Hidden native select for form submission */}
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          tabIndex={-1}
          className={styles.hiddenSelect}
          aria-hidden="true"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom trigger button */}
        <button
          type="button"
          className={`${styles.trigger} ${icon ? styles.hasIcon : ""} ${error ? styles.hasError : ""} ${isOpen ? styles.isOpen : ""} ${disabled ? styles.isDisabled : ""}`}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={selectId}
          disabled={disabled}
        >
          {icon && <span className={styles.icon}>{icon}</span>}
          <span
            className={`${styles.valueText} ${!selectedOption ? styles.placeholder : ""}`}
          >
            {displayLabel}
          </span>
          <span className={`${styles.chevron} ${isOpen ? styles.rotated : ""}`}>
            <HiChevronDown />
          </span>
        </button>

        {/* Dropdown list */}
        {isOpen && (
          <ul
            ref={listRef}
            className={styles.dropdown}
            role="listbox"
            aria-labelledby={selectId}
            style={listHeight ? { maxHeight: listHeight } : undefined}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.option} ${isSelected ? styles.selected : ""} ${isHighlighted ? styles.highlighted : ""} ${option.disabled ? styles.optionDisabled : ""}`}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  onMouseEnter={() =>
                    !option.disabled && setHighlightedIndex(index)
                  }
                >
                  <span className={styles.optionLabel}>{option.label}</span>
                  {isSelected && (
                    <span className={styles.checkIcon}>
                      <HiCheck />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
