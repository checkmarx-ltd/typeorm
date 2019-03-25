import "reflect-metadata";
import {closeTestingConnections, createTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src";
import {Post} from "./entity/Post";

describe("github issues > #211 where in query issue", () => {

    let connections: Connection[];
    beforeAll(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    afterAll(() => closeTestingConnections(connections));

    test("should not fail if WHERE IN expression is used", () => Promise.all(connections.map(async connection => {

        for (let i = 0; i < 10; i++) {
            const post1 = new Post();
            post1.title = "post #" + i;
            post1.text = "about post";
            await connection.manager.save(post1);
        }

        const loadedPosts1 = await connection.manager
            .createQueryBuilder(Post, "post")
            .where("post.id IN (:...ids)", { ids: [1, 2, 3] })
            .getMany();

        expect(loadedPosts1.length).toEqual(3);

        const loadedPosts2 = await connection.manager
            .createQueryBuilder(Post, "post")
            .where("post.text = :text", { text: "about post" })
            .andWhere("post.title IN (:...titles)", { titles: ["post #1", "post #2", "post #3"] })
            .getMany();

        expect(loadedPosts2.length).toEqual(3);
    })));

});