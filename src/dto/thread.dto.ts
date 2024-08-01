import { Rule, RuleType } from "@midwayjs/validate";

export class ThreadDto {
    @Rule(RuleType.string().required())
    content: string;
}