from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock


def image_api_value(image, context=None):
    """Return image data the public frontend can render directly."""
    if not image:
        return None
    rendition = image.get_rendition("max-2000x2000")
    request = (context or {}).get("request")
    url = request.build_absolute_uri(rendition.url) if request else rendition.url
    return {"full_url": url, "width": rendition.width, "height": rendition.height, "alt": image.title}


class ApiImageChooserBlock(ImageChooserBlock):
    def get_api_representation(self, value, context=None):
        return image_api_value(value, context)


class PullQuoteBlock(blocks.StructBlock):
    quote = blocks.CharBlock(required=True)
    attribution = blocks.CharBlock(required=False)

    class Meta:
        icon = "openquote"
        template = "content/blocks/pull_quote.html"


class HeadingBlock(blocks.StructBlock):
    text = blocks.CharBlock(max_length=180)
    level = blocks.ChoiceBlock(choices=[("h2", "Heading 2"), ("h3", "Heading 3")], default="h2")

    class Meta:
        icon = "title"
        label = "Section heading"
        template = "content/blocks/heading.html"


class CaptionedImageBlock(blocks.StructBlock):
    image = ApiImageChooserBlock()
    caption = blocks.CharBlock(required=False, max_length=300)

    class Meta:
        icon = "image"
        label = "Full-width image"
        template = "content/blocks/captioned_image.html"


class TwoImageBlock(blocks.StructBlock):
    left_image = ApiImageChooserBlock(label="Left image")
    left_caption = blocks.CharBlock(required=False, max_length=200)
    right_image = ApiImageChooserBlock(label="Right image")
    right_caption = blocks.CharBlock(required=False, max_length=200)

    class Meta:
        icon = "image"
        label = "Two images"
        template = "content/blocks/two_images.html"


class GalleryImageBlock(blocks.StructBlock):
    image = ApiImageChooserBlock()
    caption = blocks.CharBlock(required=False, max_length=200)


class GalleryBlock(blocks.ListBlock):
    def __init__(self, **kwargs):
        super().__init__(GalleryImageBlock(), **kwargs)

    class Meta:
        icon = "image"
        label = "Inline image gallery"
        template = "content/blocks/gallery.html"


class CallToActionBlock(blocks.StructBlock):
    heading = blocks.CharBlock(required=False, max_length=120)
    text = blocks.RichTextBlock(required=False, features=["bold", "italic", "link"])
    button_label = blocks.CharBlock(max_length=50, default="Learn more")
    button_url = blocks.URLBlock(help_text="Use the full https:// address.")
    style = blocks.ChoiceBlock(
        choices=[("gold", "Gold button"), ("dark", "Dark button"), ("outline", "Outline button")],
        default="gold",
    )

    class Meta:
        icon = "link"
        label = "Call to action / button"
        template = "content/blocks/call_to_action.html"


class HighlightBlock(blocks.StructBlock):
    heading = blocks.CharBlock(required=False, max_length=120)
    text = blocks.RichTextBlock(features=["bold", "italic", "link", "ol", "ul"])

    class Meta:
        icon = "pick"
        label = "Highlighted information"
        template = "content/blocks/highlight.html"


class VideoBlock(blocks.StructBlock):
    url = blocks.URLBlock(help_text="YouTube or Vimeo link")
    caption = blocks.CharBlock(required=False, max_length=200)

    class Meta:
        icon = "media"
        label = "Embedded video"
        template = "content/blocks/video.html"


class BodyStreamBlock(blocks.StreamBlock):
    heading = HeadingBlock()
    paragraph = blocks.RichTextBlock(
        features=["bold", "italic", "link", "ol", "ul", "blockquote", "h2", "h3"]
    )
    image = ApiImageChooserBlock(label="Simple image")
    captioned_image = CaptionedImageBlock()
    two_images = TwoImageBlock()
    gallery = GalleryBlock(min_num=2)
    quote = PullQuoteBlock()
    highlight = HighlightBlock()
    call_to_action = CallToActionBlock()
    video = VideoBlock()
    divider = blocks.StaticBlock(
        admin_text="Horizontal divider", icon="horizontalrule", template="content/blocks/divider.html"
    )
