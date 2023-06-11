// DB에 연결하는 로직 구성 - DB에서 생성한 클러스터를 어플리케이션에 연결

import MongoClient from "mongodb/lib/mongo_client";

export async function connectToDatabase() {
	const dbUrl = "austinhwangkr:SkGlkHV8CgcJz84O";
	const client = await MongoClient.connect(
		`mongodb+srv://${dbUrl}@cluster0.rrcxzv2.mongodb.net/?retryWrites=true&w=majority`
	);
	return client;
}
