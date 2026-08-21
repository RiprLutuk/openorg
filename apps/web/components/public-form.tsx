"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { type PublicFormState, submitPublicForm } from "@/app/actions";

const initialState: PublicFormState = { status: "idle", message: "" };

export function PublicContactForm() {
  const [state, formAction, pending] = useActionState(
    submitPublicForm,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Pesan Anda telah berhasil terkirim ke Sekretariat!");
    } else if (state.status === "error") {
      toast.error(state.message || "Gagal mengirimkan pesan.");
    }
  }, [state.status, state.message]);

  if (state.status === "success")
    return (
      <div className="form-success" role="status">
        <span>
          <CheckCircle2 size={25} />
        </span>
        <h3>Pesan Terkirim</h3>
        <p>{state.message}</p>
      </div>
    );

  return (
    <form action={formAction}>
      <label>
        Nama Lengkap
        <input
          name="name"
          required
          minLength={2}
          maxLength={160}
          aria-invalid={Boolean(state.errors?.name)}
        />
        {state.errors?.name && (
          <small className="field-error">{state.errors.name}</small>
        )}
      </label>
      <label>
        Alamat Email
        <input
          name="email"
          type="email"
          required
          maxLength={320}
          aria-invalid={Boolean(state.errors?.email)}
        />
        {state.errors?.email && (
          <small className="field-error">{state.errors.email}</small>
        )}
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="full">
        Pesan / Pertanyaan Anda
        <textarea
          name="message"
          rows={5}
          required
          minLength={10}
          maxLength={5_000}
          aria-invalid={Boolean(state.errors?.message)}
        />
        {state.errors?.message && (
          <small className="field-error">{state.errors.message}</small>
        )}
      </label>
      {state.status === "error" && (
        <p className="form-error full" role="alert">
          {state.message}
        </p>
      )}
      <button className="button primary" type="submit" disabled={pending}>
        {pending ? "Mengirimkan…" : "Kirim Pesan"} <ArrowRight size={17} />
      </button>
    </form>
  );
}
