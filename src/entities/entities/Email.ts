import { Column, Entity } from "typeorm";

@Entity("email", { schema: "kirim_email" })
export class Email {
  @Column("char", {
    primary: true,
    name: "id_email",
    length: 36,
    default: () => "'uuid()'",
  })
  idEmail: string;

  @Column("varchar", { name: "from_module", nullable: true, length: 136 })
  fromModule: string | null;

  @Column("varchar", { name: "from_module_id", nullable: true, length: 36 })
  fromModuleId: string | null;

  @Column("varchar", { name: "id_kontak", nullable: true, length: 36 })
  idKontak: string | null;

  @Column("varchar", { name: "recipient_email", length: 255 })
  recipientEmail: string;

  @Column("varchar", { name: "nama", length: 255 })
  nama: string;

  @Column("varchar", { name: "pelanggan", length: 255 })
  pelanggan: string;

  @Column("varchar", { name: "subject", length: 255 })
  subject: string;

  @Column("varchar", {
    name: "tipe_attachment",
    nullable: true,
    length: 10,
    default: () => "'attachment'",
  })
  tipeAttachment: string | null;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["pending", "ready", "sent", "failed"],
    default: () => "'pending'",
  })
  status: "pending" | "ready" | "sent" | "failed" | null;

  @Column("datetime", { name: "sent_at", nullable: true })
  sentAt: Date | null;

  @Column("text", { name: "failed_reason", nullable: true })
  failedReason: string | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @Column("timestamp", {
    name: "updated_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date | null;
}
