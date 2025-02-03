import { Column, Entity } from "typeorm";

@Entity("email_queue", { schema: "kirim_email" })
export class EmailQueue {
  @Column("char", {
    primary: true,
    name: "id_email_queue",
    length: 36,
    default: () => "'uuid()'",
  })
  idEmailQueue: string;

  @Column("char", { name: "id_email", length: 36 })
  idEmail: string;

  @Column("int", { name: "priority", nullable: true, default: () => "'0'" })
  priority: number | null;

  @Column("int", {
    name: "attempt_count",
    nullable: true,
    default: () => "'0'",
  })
  attemptCount: number | null;

  @Column("datetime", { name: "last_attempt", nullable: true })
  lastAttempt: Date | null;

  @Column("datetime", { name: "next_attempt", nullable: true })
  nextAttempt: Date | null;

  @Column("enum", {
    name: "status",
    nullable: true,
    enum: ["pending", "processing", "failed", "completed"],
    default: () => "'pending'",
  })
  status: "pending" | "processing" | "failed" | "completed" | null;

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
