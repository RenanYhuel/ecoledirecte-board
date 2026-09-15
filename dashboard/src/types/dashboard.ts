export interface AccountInfo {
  id: number;
  id_login?: number;
  uid?: string;
  identifiant: string;
  account_type: string;
  first_name: string;
  last_name: string;
  email?: string;
  establishment_name?: string;
  class_name?: string;
  class_code?: string;
  photo_url?: string;
  is_main: boolean;
}

export interface Grade {
  id: number;
  title: string;
  subject_code: string;
  subject_name: string;
  period_code: string;
  duty_type?: string;
  value?: number;
  value_str: string;
  out_of?: number;
  out_of_str: string;
  coef: number;
  class_avg?: number;
  class_min?: number;
  class_max?: number;
  date: string;
  comment?: string;
  non_significant: boolean;
}

export interface SubjectAverage {
  id: number;
  subject_code: string;
  subject_name: string;
  student_avg?: number;
  class_avg?: number;
  class_min?: number;
  class_max?: number;
  coef: number;
  teachers: string[];
}

export interface Period {
  id: string;
  code: string;
  name: string;
  is_annual: boolean;
  start_date: string;
  end_date: string;
  is_closed: boolean;
  student_avg?: number;
  class_avg?: number;
  class_min?: number;
  class_max?: number;
  main_teacher?: string;
  subjects: SubjectAverage[];
}

export interface Attachment {
  id: number;
  name: string;
  date: string;
  size?: number;
}

export interface HomeworkItem {
  id: number;
  subject_name: string;
  subject_code: string;
  due_date: string;
  given_date?: string;
  is_done: boolean;
  interrogation: boolean;
  submit_online: boolean;
  description_html?: string;
  attachments: Attachment[];
}

export interface DayHomework {
  date: string;
  items: HomeworkItem[];
}

export interface AbsenceRetard {
  id: number;
  item_type: string;
  date: string;
  display_date: string;
  label: string;
  reason?: string;
  is_justified: boolean;
  comment?: string;
}

export interface SanctionEncouragement {
  id: number;
  item_type: string;
  date: string;
  label: string;
  reason?: string;
  comment?: string;
}

export interface MessageSummary {
  id: number;
  subject: string;
  sender: string;
  sender_role?: string;
  sender_function?: string;
  date: string;
  is_read: boolean;
  has_attachments: boolean;
}

export interface MessageAttachment {
  id: number;
  name: string;
  size?: number;
}

export interface MessageDetail {
  id: number;
  subject: string;
  sender: string;
  date: string;
  content_html: string;
  attachments: MessageAttachment[];
}

export interface CourseSlot {
  id: number;
  title: string;
  subject_code: string;
  subject_name: string;
  course_type: string;
  start_date: string;
  end_date: string;
  color: string;
  teacher?: string;
  room?: string;
  class_name?: string;
  group_name?: string;
  is_cancelled: boolean;
  is_modified: boolean;
  has_homework: boolean;
  has_session_content: boolean;
}

export interface DashboardOverview {
  student?: AccountInfo;
  notes: {
    periods: Period[];
    recent_grades: Grade[];
    general_average?: number;
    class_average?: number;
  };
  homework: {
    days: DayHomework[];
    pending_count: number;
    done_count: number;
  };
  school_life: {
    absences_retards: AbsenceRetard[];
    sanctions: SanctionEncouragement[];
    total_absences: number;
    total_lateness: number;
    unjustified_count: number;
  };
  messages: {
    received: MessageSummary[];
    unread_count: number;
  };
  timetable: {
    today: CourseSlot[];
    tomorrow?: CourseSlot[];
    next_slot?: CourseSlot;
  };
  server_time: string;
  authenticated: boolean;
}
