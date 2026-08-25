"use client";

import { CheckCircle2, ChevronDown, Info, Loader2, Search, X } from "lucide-react";
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

export interface SearchableOption {
  value: string;
  label: string;
  subLabel?: string | undefined;
}

export interface SearchableSelectProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string, selectedOption?: SearchableOption) => void;
  onBlur?: () => void;
  options: SearchableOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  className?: string;
  emptyText?: string;
}

export function SearchableSelect({
  id,
  name,
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Ketik untuk mencari...",
  disabled = false,
  loading = false,
  error = false,
  className = "",
  emptyText = "Pilihan tidak ditemukan",
}: SearchableSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const cleanSearch = searchTerm.toLowerCase().trim();
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(cleanSearch);
      const matchValue = opt.value.toLowerCase().includes(cleanSearch);
      const matchSub = opt.subLabel?.toLowerCase().includes(cleanSearch);
      return matchLabel || matchValue || matchSub;
    });
  }, [options, searchTerm]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (isOpen) {
          setIsOpen(false);
          setSearchTerm("");
          onBlur?.();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onBlur]);

  // Auto focus on input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (opt: SearchableOption) => {
      onChange(opt.value, opt);
      setIsOpen(false);
      setSearchTerm("");
      onBlur?.();
    },
    [onChange, onBlur],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSearchTerm("");
      onBlur?.();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0,
      );
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1,
      );
      return;
    }

    if (e.key === "Enter" && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
      e.preventDefault();
      handleSelect(filteredOptions[highlightedIndex]!);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`searchable-select-wrapper ${className} ${disabled ? "is-disabled" : ""} ${error ? "has-error" : ""}`}
      onKeyDown={handleKeyDown}
    >
      <input type="hidden" name={name} value={value} readOnly />

      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        className={`searchable-select-trigger ${isOpen ? "is-open" : ""}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`searchable-select-display-text ${
            !selectedOption ? "is-placeholder" : ""
          }`}
        >
          {loading ? (
            <span className="searchable-loading-badge">
              <Loader2 size={13} className="animate-spin" />
              <span>Memuat pilihan...</span>
            </span>
          ) : selectedOption ? (
            <span className="searchable-selected-value">
              <span className="searchable-selected-label">{selectedOption.label}</span>
              {selectedOption.subLabel && (
                <span className="searchable-sub-label">
                  {" "}
                  {selectedOption.subLabel}
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>

        <span className="searchable-select-arrow">
          {loading ? (
            <Loader2 size={14} className="animate-spin text-sky-600" />
          ) : (
            <ChevronDown
              size={15}
              className={`searchable-chevron ${isOpen ? "is-rotated" : ""}`}
            />
          )}
        </span>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="searchable-select-popover" role="listbox">
          {/* Search Box */}
          <div
            className="searchable-select-search-box"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              width: "100%",
              marginBottom: "8px",
            }}
          >
            <Search
              size={15}
              className="searchable-search-icon"
              style={{
                position: "absolute",
                left: "12px",
                pointerEvents: "none",
                color: "#64748b",
                zIndex: 2,
              }}
            />
            <input
              ref={inputRef}
              type="text"
              className="searchable-search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(-1);
              }}
              placeholder={searchPlaceholder}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                height: "38px",
                minHeight: "38px",
                paddingLeft: "38px",
                paddingRight: "34px",
                fontSize: "13px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                color: "#0f172a",
                outline: "none",
              }}
            />
            {searchTerm && (
              <button
                type="button"
                className="searchable-clear-search-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                  inputRef.current?.focus();
                }}
                title="Hapus pencarian"
                style={{
                  position: "absolute",
                  right: "8px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#e2e8f0",
                  color: "#64748b",
                  border: "none",
                  cursor: "pointer",
                  zIndex: 2,
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="searchable-select-options-list" ref={listRef}>
            {loading ? (
              <div className="searchable-select-state-msg">
                <Loader2 size={16} className="animate-spin text-sky-600" />
                <span>Memuat data wilayah...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="searchable-select-state-msg empty">
                <Info size={15} color="#94a3b8" />
                <span>{emptyText}</span>
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`searchable-select-option-item ${
                      isSelected ? "is-selected" : ""
                    } ${isHighlighted ? "is-highlighted" : ""}`}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="searchable-option-text-group">
                      <span className="searchable-option-main-label">
                        {opt.label}
                      </span>
                      {opt.subLabel && (
                        <span className="searchable-option-sub-badge">
                          {opt.subLabel}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <CheckCircle2
                        size={15}
                        className="searchable-option-check-icon"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
