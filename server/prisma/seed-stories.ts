// Seed content for the demo dataset. Per the confirmed scope decision
// (docs/phase2-requirements.md §9, trimmed in docs/phase4-effort-estimation.md
// §10.3 to 2 regions for the 24h build): Ghana (Akan/Twi) and Nigeria (Yoruba),
// two well-documented trickster-tale traditions.
//
// Every story below is an ORIGINAL retelling, written for this project, of a
// long-documented traditional tale-type — not copied or adapted from any
// specific existing book, website, or archive (docs/phase2-requirements.md §8
// constraint: "seed content must be self-authored/retold... never scraped").
// Two of the four (the "hoarded wisdom" pair) are a genuine, real cross-cultural
// tale-type match, deliberately chosen so the seed data can demonstrate the
// variant-linking feature (FR6/FR10) honestly, not artificially.
//
// Provenance is labeled transparently: this is curated seed content authored
// for the exam demo, not a real first-person community submission — see
// docs/phase11-user-manual.md for how that distinction is disclosed to users.
import type { PrismaClient } from "@prisma/client";

const SEED_NARRATOR = "Traditional (retold for the OpenFolklore seed dataset)";

export async function seedStories(prisma: PrismaClient, submitterId: string, moderatorId: string) {
  const existing = await prisma.story.count();
  if (existing > 0) {
    console.log("Stories already seeded — skipping.");
    return;
  }

  await prisma.story.create({
    data: {
      title: "Why Stories Belong to Ananse",
      textBody: `Long ago, all the stories in the world belonged to Nyame, the Sky God, and no one on earth was allowed to tell them. Ananse the spider went to Nyame and asked to buy them.

Nyame laughed. "Many have asked before you, and none have paid my price. You would have to bring me Onini the python, who can swallow a grown man; the swarm of stinging hornets that no one dares disturb; and Osebo the leopard, whose claws are the fear of every farmer. Bring me these three, alive, and the stories are yours."

Ananse agreed, and went to work with his wits rather than his strength.

He found Onini stretched out beside the river and said, "My wife and I have been arguing. She says you are longer than the young bamboo growing over there; I say the bamboo is longer. Will you settle it for us?" Flattered, Onini agreed to stretch himself alongside the bamboo pole to be measured. As he stretched out straight, Ananse bound him to the pole with vine, "just to keep you from bending while we check," and carried him, tied and helpless, to Nyame.

Next, Ananse found the hornets' nest and poured a little water over it, then held a leaf over his own head. "It is raining," he called to them, "come shelter in my gourd, it is dry inside." The hornets, fooled by the drops he had poured, flew gratefully into the gourd, and Ananse sealed the opening the moment the last one entered.

For Osebo the leopard, Ananse dug a deep pit on the leopard's usual path and covered it with branches and leaves. When Osebo came prowling by, he fell straight through and could not climb out. Ananse lowered a vine "to help," and when Osebo climbed partway up, Ananse tied it fast around him instead, hauling him up bound rather than free.

Ananse brought Onini, the hornets in their gourd, and Osebo to Nyame's court, and the Sky God kept his word. From that day, the stories of the world belonged to Ananse, and that is why, among the Akan people, a folktale is still called Anansesɛm — Ananse's story — no matter who is telling it.`,
      status: "published",
      language: "Twi",
      region: "Ghana",
      ethnicGroup: "Akan",
      narratorName: SEED_NARRATOR,
      submitterId,
    },
  });

  const anansePot = await prisma.story.create({
    data: {
      title: "Ananse and the Pot of Wisdom",
      textBody: `Ananse decided one day that he alone should be wise, and that all the world's wisdom should belong to him. So he went about gathering it — every clever thought, every piece of good sense, every lesson anyone had ever learned — and packed it all into a great pot with a tight lid.

Not content to keep it at home where someone might find it, Ananse resolved to hide the pot at the very top of the tallest tree in the forest, where no one else could ever reach it. He tied the pot to a rope and hung it against his belly, so he could climb with his hands and feet free, and started up the trunk.

But the pot was round and wide, and every time Ananse tried to climb, it bumped against the tree and threw him off balance. He would gain a little height, slip, and start again, growing more frustrated each time.

His young son had followed him into the forest and stood watching from below. "Father," the boy called up, "wouldn't it be easier to tie the pot on your back instead of your front? Then it would not be in your way as you climb."

Ananse froze on the trunk. He, who had gathered all the wisdom in the world into a single pot so that no one would be wiser than him, had just been out-thought by his own child — who had never even seen inside the pot. If his son could see something so simple that Ananse himself had missed, then wisdom could not possibly belong to one person alone, however much of it he collected.

In his frustration, Ananse threw the pot down from the tree. It shattered on the ground, and the wisdom inside scattered in every direction — into the rivers, the wind, the soil, and the minds of people everywhere. That is why, to this day, no single person has all the wisdom in the world; a little of it is found in everyone, waiting to be noticed, sometimes by someone very young.`,
      status: "published",
      language: "Twi",
      region: "Ghana",
      ethnicGroup: "Akan",
      narratorName: SEED_NARRATOR,
      submitterId,
    },
  });

  await prisma.story.create({
    data: {
      title: "Ijapa and the Feast in the Sky",
      textBody: `When word came that the sky-people were holding a great feast, every bird in the forest was invited — for every bird could fly there. Ijapa the tortoise could not fly, but he loved a feast more than any creature alive, and he was not going to be left behind.

Ijapa went from bird to bird, asking each to lend him a single feather. "One feather from each of you," he said, "and together they will be enough to make me wings." The birds, good-natured, agreed, and soon Ijapa was covered in a fine borrowed coat of feathers of every color. In return for their kindness, Ijapa offered to be the one who spoke on their behalf at the feast, since he was known to have a clever tongue.

Before they set off, Ijapa quietly told the other birds, "In the sky, it is polite to take a new name for such a grand occasion. I will be called 'All of You.'" The birds thought little of it and agreed to call him that if asked.

When the feasting party arrived, the hosts asked who the magnificent feast prepared that day was for. Ijapa answered before any bird could speak: "It is for All of You," he said — and then declared that since his name was All of You, the feast was, by their own words, for him alone. He ate his fill and more, sharing nothing, while the real birds went hungry and grew angrier by the moment.

Furious at the trick, each bird flew to Ijapa and took back the single feather it had lent him, until he stood featherless and stranded, high in the sky with no way down. In desperation, he begged a kindly bird to fly ahead and tell his wife to spread every soft mat and cushion she owned in the yard below, to break his fall. But the bird, still angry on behalf of the others, told Ijapa's wife the opposite — to bring out every hard pot and pestle instead.

Ijapa leapt and fell, and fell hard, straight onto the pots below. His shell cracked into many pieces. A wise healer patched him back together as best as could be done, but the cracks never fully disappeared — and that, the Yoruba say, is why the tortoise's shell looks pieced-together and uneven to this very day.`,
      status: "published",
      language: "Yoruba",
      region: "Nigeria",
      ethnicGroup: "Yoruba",
      narratorName: SEED_NARRATOR,
      submitterId,
    },
  });

  // Left pending_review deliberately, so the moderation queue is not empty on
  // first login — a moderator can approve it and link it to "Ananse and the
  // Pot of Wisdom" live during a demo (docs/phase6-design.md §3.5, UC5), since
  // this is a genuine cross-cultural variant of the same tale-type, not a
  // fabricated one.
  await prisma.story.create({
    data: {
      title: "Ijapa and the Gourd of Wisdom",
      textBody: `There was a time when Ijapa the tortoise decided that all the wisdom in the world should be his alone. He travelled far and wide, collecting every clever idea and hard-won lesson he could find, and sealed them all inside a large gourd.

Ijapa did not want to risk anyone stumbling upon his gourd of wisdom at home, so he decided to hang it from the highest branch of the great iroko tree, where nothing could reach it but the sky. He tied the gourd firmly against his chest so his hands would be free to climb, and began working his way up the trunk.

But the gourd was heavy and wide, and it swung against the bark with every move he made, so that he could barely climb a length before sliding back down. Again and again he tried, and again and again the gourd defeated him.

His grandchild, playing nearby, watched him struggle for a long while before calling out, "Grandfather, would it not be simpler to tie the gourd behind you, on your back, instead of in front where it blocks your legs?"

Ijapa stopped climbing. He had crossed rivers and forests to gather every scrap of wisdom in the world into that gourd so that he alone would hold it — and here was a child, who had never even looked inside, showing him something he had not seen himself. If a child could out-think him so easily, then wisdom plainly could not be hoarded by one creature, no matter how far he traveled to collect it.

In his anger and shame, Ijapa hurled the gourd to the ground, where it broke into countless pieces, scattering wisdom across the land, the water, and the wind — so that a little of it settled everywhere, in everyone, and no one creature has ever held it all again.`,
      status: "pending_review",
      language: "Yoruba",
      region: "Nigeria",
      ethnicGroup: "Yoruba",
      narratorName: SEED_NARRATOR,
      submitterId,
    },
  });

  console.log(
    `Seeded 4 stories (3 published, 1 pending_review). Reviewing moderator on hand: ${moderatorId}. Variant pair ready to link once approved: "${anansePot.title}" <-> "Ijapa and the Gourd of Wisdom".`,
  );
}
