import { Column, Entity } from "typeorm";

@Entity("email_content", { schema: "kirim_email" })
export class EmailContent {
  @Column("char", {
    primary: true,
    name: "id_email_content",
    length: 36,
    default: () => "'uuid()'",
  })
  idEmailContent: string;

  @Column("char", { name: "id_email", length: 36 })
  idEmail: string;

  @Column("varchar", { name: "token", nullable: true, length: 500 })
  token: string | null;

  @Column("text", { name: "email_body" })
  emailBody: string;

  @Column("text", { name: "email_body_text", nullable: true })
  emailBodyText: string | null;

  @Column("json", { name: "headers", nullable: true })
  headers: object | null;

  @Column("json", { name: "attachments", nullable: true })
  attachments: object | null;

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
