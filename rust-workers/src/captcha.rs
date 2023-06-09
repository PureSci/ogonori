use crate::card_handler::CardsHandleType;
use crate::card_handler::Character;
use crate::drop::ocr;
use image::DynamicImage;
use leptess::LepTess;
use leptess::Variable;
use tokio::sync::mpsc;
use tokio::sync::mpsc::Sender;
use tokio::sync::oneshot;

static CORDS_GEN: &[&[u32]] = &[
    &[18, 460, 290, 27],
    &[18, 488, 290, 27],
    &[41, 430, 108, 27],
];

pub async fn captcha_ocr_loop(
    mut captcha_receiver: mpsc::Receiver<(DynamicImage, oneshot::Sender<Vec<Character>>)>,
    init_sender: Sender<bool>,
    card_handler_sender: mpsc::Sender<CardsHandleType>,
) {
    let mut workers: Vec<LepTess> = vec![];
    for _ in 0..3 {
        let mut worker = LepTess::new(None, "eng").unwrap();
        worker
            .set_variable(Variable::TesseditPagesegMode, "7")
            .unwrap();
        workers.push(worker)
    }
    init_sender.send(true).await.unwrap();
    loop {
        let (im, return_sender) = captcha_receiver.recv().await.unwrap();
        let output = ocr(&mut workers, &im, CORDS_GEN);
        let card = vec![Character {
            name: output[0].to_owned(),
            series: output[1].to_owned(),
            gen: Some(output[2].to_owned()),
            wl: None,
        }];
        let card_handler_sender_sub = card_handler_sender.clone();
        tokio::spawn(async move {
            card_handler_sender_sub
                .send(CardsHandleType::FindCard(card, return_sender))
                .await
        });
    }
}
