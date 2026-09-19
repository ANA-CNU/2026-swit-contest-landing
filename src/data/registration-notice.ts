export type RegistrationNotice = {
  readonly enabled: boolean;
  readonly title: string;
  readonly paragraphs: readonly string[];
};

export const REGISTRATION_NOTICE = {
  enabled: true,
  title: '충남대학교 학생 참가 접수 마감',
  paragraphs: [
    '장소 수용 인원 제한으로 충남대학교 학생의 참가 접수가 마감되었습니다.',
    '운영진은 정원 확대를 위해 노력하고 있으며, 추가 모집이 시작되면 신속히 신청해 주시면 감사하겠습니다.',
  ],
} as const satisfies RegistrationNotice;
