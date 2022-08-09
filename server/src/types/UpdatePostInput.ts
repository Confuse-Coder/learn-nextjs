import { Field, ID, InputType } from "type-graphql";

@InputType()
export class UpdatePostInput {
    @Field(_type => ID)
    id: number

    @Field(_type => ID)
    title: string

    @Field(_type => ID)
    text: string
}